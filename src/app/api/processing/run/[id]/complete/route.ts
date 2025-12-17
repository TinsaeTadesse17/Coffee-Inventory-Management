import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyProcessingComplete, notifyLowJuteBagStock, notifyBatchReady } from "@/lib/notification-service"
import { Role } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const {
      exportQuantity,
      rejectQuantity = 0,
      outputBagSize = "KG_60",
    } = data

    if (!exportQuantity) {
      return NextResponse.json({ error: "Export quantity is required" }, { status: 400 })
    }

    // Fetch the processing run with its inputs
    const processingRun = await prisma.processingRun.findUnique({
      where: { id },
      include: {
        inputs: {
          include: {
            batch: true
          }
        }
      }
    })

    if (!processingRun) {
      return NextResponse.json({ error: "Processing run not found" }, { status: 404 })
    }

    if (processingRun.status === "COMPLETED") {
      return NextResponse.json({ error: "Processing run is already completed" }, { status: 400 })
    }

    // Calculate total input weight
    let totalInputWeight = processingRun.inputs.reduce((sum, input) => sum + input.weightUsed, 0)

    // Fallback for legacy runs or data issues: try to sum from inputBatches if inputs is empty
    // Note: This assumes the full batch quantity was used, which might not be accurate but is better than 0
    if (totalInputWeight === 0 && processingRun.inputs.length === 0) {
       // We can't easily get the weight used from legacy data without more complex logic.
       // For now, we'll log a warning.
       console.warn(`Processing Run ${processingRun.runNumber} has no inputs. Yield calculation will be 0.`)
    }

    // Validate weights
    if (totalInputWeight > 0 && (exportQuantity + rejectQuantity) > totalInputWeight) {
      return NextResponse.json(
        { error: `Total output (${exportQuantity + rejectQuantity} kg) cannot exceed input weight (${totalInputWeight} kg)` },
        { status: 400 }
      )
    }

    console.log(`Completing Run ${processingRun.runNumber}: Input=${totalInputWeight}, Export=${exportQuantity}, Reject=${rejectQuantity}`)

    // Calculate waste and yield
    const wasteQuantity = totalInputWeight - exportQuantity - rejectQuantity
    const yieldRatio = totalInputWeight > 0 ? exportQuantity / totalInputWeight : 0

    // Calculate bag usage
    const bagSizeMap: Record<string, number> = {
      KG_30: 30,
      KG_50: 50,
      KG_60: 60,
      KG_85: 85,
    };
    const bagCapacity = bagSizeMap[outputBagSize] || 60;
    // Usually we bag the export quantity. Rejects might be bagged differently or not tracked here.
    // Assuming we bag the export quantity.
    const bagsUsed = Math.ceil(exportQuantity / bagCapacity);

    // Update Processing Run
    const updatedRun = await prisma.processingRun.update({
      where: { id },
      data: {
        endTime: new Date(),
        status: "COMPLETED",
        exportQuantity,
        rejectQuantity,
        wasteQuantity,
        yieldRatio,
        jotbagQuantity: bagsUsed,
        notes: processingRun.notes + `\nCompleted. Packed in ${bagsUsed} x ${outputBagSize} bags.`,
      }
    })

    // Update Jute Bag Inventory
    try {
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
      }
    } catch (error) {
      console.error("Failed to update jute bag inventory:", error);
    }

    // Notifications
    // Use the first batch for notification context if available
    if (processingRun.inputs.length > 0) {
      const primaryBatch = processingRun.inputs[0].batch;
      
      await notifyProcessingComplete({
        batchId: primaryBatch.id,
        batchNumber: primaryBatch.batchNumber,
        processingRunId: processingRun.id,
      })

      // Notify Export Manager
      await notifyBatchReady({
        batchId: primaryBatch.id,
        batchNumber: primaryBatch.batchNumber,
        nextRole: Role.EXPORT_MANAGER,
        stepName: "Export Contract Creation",
      })
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "ProcessingRun",
        entityId: processingRun.id,
        action: "COMPLETE_PROCESSING_RUN",
        changes: JSON.stringify({ 
          exportQuantity, 
          rejectQuantity, 
          wasteQuantity, 
          yieldRatio, 
          bagsUsed 
        }),
      },
    })

    return NextResponse.json({
      success: true,
      processingRun: updatedRun,
      yieldRatio
    })

  } catch (error) {
    console.error("Failed to complete processing run:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete processing run" },
      { status: 500 }
    )
  }
}
