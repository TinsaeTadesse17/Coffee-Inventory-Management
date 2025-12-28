import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyProcessingComplete, notifyLowJuteBagStock } from "@/lib/notification-service"
import { generateId } from "@/lib/utils"
import { Role, Batch } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const {
      inputs, // Array of { batchId, weight }
      batchId, // Legacy support
      inputWeight, // Legacy support
      processType = "EXPORT",
      processingGrade,
      exportQuantity: providedExportQuantity,
      rejectQuantity: providedRejectQuantity,
      wasteQuantity: providedWasteQuantity,
      processingCosts = [],
      outputBagSize = "KG_60",
    } = data

    // Normalize inputs
    let processingInputs: { batchId: string, weight: number }[] = [];
    if (inputs && Array.isArray(inputs)) {
      processingInputs = inputs;
    } else if (batchId && inputWeight) {
      processingInputs = [{ batchId, weight: Number(inputWeight) }];
    } else {
      return NextResponse.json({ error: "No inputs provided" }, { status: 400 });
    }

    // Validate all batches
    const validatedBatches: { batch: Batch; weight: number }[] = [];
    for (const input of processingInputs) {
      const batch = await prisma.batch.findFirst({
        where: { 
          OR: [
            { id: input.batchId },
            { batchNumber: input.batchId },
          ],
          status: "STORED"
        },
      });

      if (!batch) {
        return NextResponse.json(
          { error: `Batch ${input.batchId} not found or not ready (must be STORED).` },
          { status: 400 }
        );
      }

      const currentQty = batch.currentQuantityKg || batch.purchasedQuantityKg;
      if (input.weight > currentQty) {
        return NextResponse.json(
          { error: `Insufficient quantity for batch ${batch.batchNumber}. Available: ${currentQty} kg, Requested: ${input.weight} kg` },
          { status: 400 }
        );
      }
      
      validatedBatches.push({ batch, weight: input.weight });
    }

    // Check if this is a "Start Run" request (no output details) or "Complete Run" (has output details)
    // For now, we assume if exportQuantity is missing, it's a start request.
    const isStartRequest = providedExportQuantity === undefined && providedRejectQuantity === undefined;

    if (isStartRequest) {
      // --- START RUN LOGIC ---
      const processingRun = await prisma.processingRun.create({
        data: {
          runNumber: generateId("RUN"),
          startTime: new Date(),
          processedByUser: { connect: { id: session.user.id } },
          notes: `Processing started. Type: ${processType}`,
          // Create ProcessingRunInput records
          inputs: {
            create: validatedBatches.map(vb => ({
              batch: { connect: { id: vb.batch.id } },
              weightUsed: vb.weight
            }))
          },
          // Keep legacy relation for now if needed, or just rely on the new model
          inputBatches: {
            connect: validatedBatches.map(vb => ({ id: vb.batch.id }))
          }
        },
      })

      // Create processing costs if provided
      if (processingCosts && processingCosts.length > 0) {
        await prisma.processingCost.createMany({
          data: processingCosts.map((cost: any) => ({
            processingRunId: processingRun.id,
            costType: cost.costType,
            amount: Number(cost.amount),
            currency: cost.currency || 'ETB',
            notes: cost.notes || null,
          })),
        })
      }

      // Create storage costs if provided
      const { storageCosts } = data;
      if (storageCosts && storageCosts.length > 0) {
        for (const sc of storageCosts) {
            await prisma.storageCost.create({
                data: {
                    batchId: sc.batchId,
                    startDate: new Date(sc.startDate),
                    endDate: new Date(),
                    daysStored: Number(sc.days),
                    juteBagCount: Number(sc.bags),
                    totalCost: Number(sc.amount)
                }
            })
        }
      }

      // Update batches: Deduct weight, keep as STORED unless empty
      for (const vb of validatedBatches) {
        const newQuantity = (vb.batch.currentQuantityKg || vb.batch.purchasedQuantityKg) - vb.weight;
        const newStatus = newQuantity <= 0.01 ? "PROCESSED" : "STORED"; // Use small epsilon for float comparison

        await prisma.batch.update({
          where: { id: vb.batch.id },
          data: {
            currentQuantityKg: newQuantity,
            status: newStatus
          }
        });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "ProcessingRun",
          entityId: processingRun.id,
          action: "START_PROCESSING_RUN",
          changes: JSON.stringify({ inputs: processingInputs, processType }),
        },
      })

      return NextResponse.json({ 
        success: true, 
        processingRun,
        message: "Processing run started"
      }, { status: 201 })
    }

    // --- COMPLETE RUN LOGIC (Legacy/Full) ---
    const totalInputWeight = processingInputs.reduce((sum, i) => sum + i.weight, 0);

    // Calculate processing output
    const exportQuantity = providedExportQuantity ? Number(providedExportQuantity) : (totalInputWeight * 0.8)
    const rejectQuantity = providedRejectQuantity ? Number(providedRejectQuantity) : 0
    const wasteQuantity = providedWasteQuantity ? Number(providedWasteQuantity) : (totalInputWeight - exportQuantity - rejectQuantity)
    const yieldRatio = exportQuantity / totalInputWeight

    // Calculate bag usage
    const bagSizeMap: Record<string, number> = {
      KG_30: 30,
      KG_50: 50,
      KG_60: 60,
      KG_85: 85,
    };
    const bagCapacity = bagSizeMap[outputBagSize] || 60;
    const quantityToBag = processType === "REJECT" ? rejectQuantity : exportQuantity;
    const bagsUsed = Math.ceil(quantityToBag / bagCapacity);

    // Create processing run
    const processingRun = await prisma.processingRun.create({
      data: {
        runNumber: generateId("RUN"),
        startTime: new Date(),
        endTime: new Date(),
        status: "COMPLETED",
        processingGrade: processingGrade,
        exportQuantity: exportQuantity,
        rejectQuantity: rejectQuantity,
        wasteQuantity: wasteQuantity,
        yieldRatio: yieldRatio,
        processedByUser: { connect: { id: session.user.id } },
        notes: `Processing completed. Type: ${processType}`,
        inputs: {
          create: validatedBatches.map(vb => ({
            batch: { connect: { id: vb.batch.id } },
            weightUsed: vb.weight
          }))
        },
        inputBatches: {
          connect: validatedBatches.map(vb => ({ id: vb.batch.id }))
        }
      }
    });

    // Update Jute Bag Inventory
    try {
      // Check if inventory exists first to avoid error if not seeded
      const inventory = await prisma.juteBagInventory.findUnique({
        where: { size: outputBagSize as any }
      });

      if (inventory) {
        await prisma.juteBagInventory.update({
          where: { size: outputBagSize as any },
          data: { quantity: { decrement: bagsUsed } }
        });

        // Check for low stock
        if (inventory.quantity - bagsUsed <= inventory.lowStockAlert) {
           try {
             await notifyLowJuteBagStock({
               size: outputBagSize,
               currentQuantity: inventory.quantity - bagsUsed,
               threshold: inventory.lowStockAlert
             });
           } catch (e) {
             console.error("Failed to send low stock notification", e);
           }
        }

        // Record bag cost
        await prisma.processingCost.create({
          data: {
            processingRunId: processingRun.id,
            costType: "Packing Materials (Jute Bags)",
            amount: bagsUsed * inventory.pricePerBag,
            currency: "ETB",
            notes: `${bagsUsed} x ${outputBagSize} @ ${inventory.pricePerBag} ETB/bag`
          }
        });
      } else {
        console.warn(`Jute bag inventory not found for size ${outputBagSize}`);
      }
    } catch (error) {
      console.error("Failed to update jute bag inventory:", error);
    }

    // Create processing costs if provided
    if (processingCosts && processingCosts.length > 0) {
      await prisma.processingCost.createMany({
        data: processingCosts.map((cost: any) => ({
          processingRunId: processingRun.id,
          costType: cost.costType,
          amount: Number(cost.amount),
          currency: cost.currency || 'ETB',
          notes: cost.notes || null,
        })),
      })
    }

    // Update batches: Deduct weight, keep as STORED unless empty
    for (const vb of validatedBatches) {
      const newQuantity = (vb.batch.currentQuantityKg || vb.batch.purchasedQuantityKg) - vb.weight;
      const newStatus = newQuantity <= 0.01 ? "PROCESSED" : "STORED";

      await prisma.batch.update({
        where: { id: vb.batch.id },
        data: {
          currentQuantityKg: newQuantity,
          status: newStatus
        }
      });
    }

    // Notify warehouse manager, export manager, and CEO
    // Use first batch for notification context
    const primaryBatch = validatedBatches[0].batch;
    await notifyProcessingComplete({
      batchId: primaryBatch.id,
      batchNumber: primaryBatch.batchNumber,
      processingRunId: processingRun.id,
    })

    // Also notify Export Manager specifically that batch is ready for export
    if (processType === "EXPORT") {
      const { notifyBatchReady } = await import("@/lib/notification-service")
      await notifyBatchReady({
        batchId: primaryBatch.id,
        batchNumber: primaryBatch.batchNumber,
        nextRole: Role.EXPORT_MANAGER,
        stepName: "Export Contract Creation",
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "ProcessingRun",
        entityId: processingRun.id,
        action: "CREATE_PROCESSING_RUN",
        changes: JSON.stringify({ exportQuantity, rejectQuantity, jotbagQuantity: bagsUsed, ...data }),
      },
    })

    return NextResponse.json({ 
      success: true, 
      processingRun,
      exportQuantity,
      rejectQuantity,
      wasteQuantity,
      yieldRatio
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create processing run:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create processing run" },
      { status: 500 }
    )
  }
}
