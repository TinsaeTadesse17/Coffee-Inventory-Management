import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { BatchStatus, Role, WarehouseEntryType, MeasurementType, JuteBagSize } from "@prisma/client"
import { convertToKilograms } from "@/lib/format-utils"
import { notifyDuplicateEntry, notifyBatchReady, notifyLowJuteBagStock } from "@/lib/notification-service"
import { generateId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user
    const allowedRoles: Role[] = [Role.WAREHOUSE, Role.ADMIN, Role.CEO]
    if (!allowedRoles.includes(user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    const {
      batchId,
      storageLocations,
      receivedWeight,
      bags,
      notes,
      entryType = WarehouseEntryType.ARRIVAL,
      measurementType = MeasurementType.KILOGRAM,
      juteBagSize,
      juteBagCount,
      feresulaBags,
    } = data

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      )
    }

    // Calculate weight based on measurement type
    let calculatedWeight = 0
    if (measurementType === MeasurementType.KILOGRAM && receivedWeight) {
      calculatedWeight = Number(receivedWeight)
    } else if (measurementType === MeasurementType.JUTE_BAG && juteBagCount && juteBagSize) {
      calculatedWeight = convertToKilograms(Number(juteBagCount), measurementType, juteBagSize)
    } else if (measurementType === MeasurementType.FERESULA && feresulaBags) {
      calculatedWeight = convertToKilograms(Number(feresulaBags), measurementType)
    }

    if (calculatedWeight <= 0) {
      return NextResponse.json(
        { error: "Invalid weight or measurement" },
        { status: 400 }
      )
    }

    let normalizedLocations: string[] = []
    if (Array.isArray(storageLocations)) {
      normalizedLocations = storageLocations.map((loc: string) => String(loc).trim()).filter(Boolean)
    } else if (typeof storageLocations === "string" && storageLocations.trim() !== "") {
      normalizedLocations = storageLocations
        .split(",")
        .map(loc => loc.trim())
        .filter(Boolean)
    }

    if (normalizedLocations.length === 0) {
      return NextResponse.json(
        { error: "At least one storage location is required" },
        { status: 400 }
      )
    }

    const entryTypeValue = typeof entryType === "string" ? entryType.toUpperCase() as WarehouseEntryType : entryType
    if (!Object.values(WarehouseEntryType).includes(entryTypeValue)) {
      return NextResponse.json(
        { error: "Invalid warehouse entry type" },
        { status: 400 }
      )
    }

    const parsedBags = bags !== undefined && bags !== null && bags !== "" ? Number(bags) : null
    if (parsedBags !== null && (Number.isNaN(parsedBags) || parsedBags < 0)) {
      return NextResponse.json(
        { error: "Invalid number of bags" },
        { status: 400 }
      )
    }

    // Find the specific batch by ID or batch number
    const batch = await prisma.batch.findFirst({
      where: { 
        OR: [
          { id: batchId },
          { batchNumber: batchId }
        ]
      },
    })

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found. Please select a valid batch." },
        { status: 400 }
      )
    }

    // Check if batch is in the correct status for warehouse receipt
    if (batch.status !== "AT_GATE" && batch.status !== "ORDERED") {
      return NextResponse.json(
        { error: `Batch is in ${batch.status} status. Only batches that are AT_GATE or ORDERED can be received.` },
        { status: 400 }
      )
    }

    // Check for duplicate entry
    const existingEntry = await prisma.warehouseEntry.findFirst({
      where: {
        batchId: batch.id,
        entryType: entryTypeValue,
      },
    })

    if (existingEntry && !batch.isDuplicateEntry) {
      // Mark as duplicate and notify CEO and Admin
      await prisma.batch.update({
        where: { id: batch.id },
        data: { isDuplicateEntry: true },
      })

      await notifyDuplicateEntry({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        submittedBy: user.id,
      })

      return NextResponse.json(
        { error: "Duplicate entry detected. Approval required from CEO or Admin." },
        { status: 409 }
      )
    }

    // Update jute bag inventory if applicable
    if (measurementType === MeasurementType.JUTE_BAG && juteBagSize && juteBagCount) {
      const juteBagInventory = await prisma.juteBagInventory.findUnique({
        where: { size: juteBagSize },
      })

      if (juteBagInventory) {
        const newQuantity = juteBagInventory.quantity - Number(juteBagCount)
        await prisma.juteBagInventory.update({
          where: { size: juteBagSize },
          data: { quantity: newQuantity },
        })

        // Check for low stock
        if (newQuantity <= juteBagInventory.lowStockAlert) {
          await notifyLowJuteBagStock({
            size: juteBagSize,
            currentQuantity: newQuantity,
            threshold: juteBagInventory.lowStockAlert,
          })
        }
      }
    }

    // Create warehouse entry
    const warehouseEntry = await prisma.warehouseEntry.create({
      data: {
        batch: { connect: { id: batch.id } },
        warehouseNumber: generateId("WHE"),
        entryType: entryTypeValue,
        storageLocations: normalizedLocations,
        arrivalWeightKg: calculatedWeight,
        measurementType: measurementType,
        juteBagSize: juteBagSize || null,
        juteBagCount: juteBagCount ? Number(juteBagCount) : null,
        feresulaBags: feresulaBags ? Number(feresulaBags) : null,
        bags: parsedBags,
        notes: notes || null,
        receivedByUser: { connect: { id: user.id } },
      },
    })

    let newStatus: BatchStatus | undefined
    if (entryTypeValue === WarehouseEntryType.ARRIVAL) {
      newStatus = BatchStatus.STORED
    } else if (entryTypeValue === WarehouseEntryType.REJECT) {
      newStatus = BatchStatus.REJECTED
    } else if (entryTypeValue === WarehouseEntryType.EXPORT) {
      newStatus = BatchStatus.EXPORT_READY
    }

    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        ...(newStatus ? { status: newStatus } : {}),
        currentLocation: normalizedLocations.join(", "),
        warehouseEntryDate: entryTypeValue === WarehouseEntryType.ARRIVAL ? new Date() : batch.warehouseEntryDate,
        currentQuantityKg: calculatedWeight,
      },
    })

    // Notify quality team that batch is ready for inspection
    if (entryTypeValue === WarehouseEntryType.ARRIVAL) {
      await notifyBatchReady({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        nextRole: Role.QUALITY,
        stepName: "Quality Inspection",
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        entity: "WarehouseEntry",
        entityId: warehouseEntry.id,
        action: "RECEIVE_BATCH",
        changes: JSON.stringify({
          entryType: entryTypeValue,
          storageLocations: normalizedLocations,
          receivedWeight: calculatedWeight,
          bags: parsedBags,
          notes,
        }),
      },
    })

    return NextResponse.json({ success: true, warehouseEntry }, { status: 201 })
  } catch (error) {
    console.error("Failed to receive batch:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to receive batch"
    console.error("Error details:", errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

