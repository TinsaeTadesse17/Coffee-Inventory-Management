import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRoles } from "@/lib/auth-helpers"
import { BatchStatus, Role, WarehouseEntryType } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRoles([Role.WAREHOUSE, Role.ADMIN])

    const data = await request.json()

    const {
      batchId,
      storageLocations,
      receivedWeight,
      bags,
      notes,
      entryType = WarehouseEntryType.ARRIVAL,
    } = data

    if (!batchId || !receivedWeight) {
      return NextResponse.json(
        { error: "Batch ID and received weight are required" },
        { status: 400 }
      )
    }

    const parsedWeight = Number(receivedWeight)
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      return NextResponse.json(
        { error: "Invalid received weight" },
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

    // Find batch that's at the gate
    const batch = await prisma.batch.findFirst({
      where: { 
        OR: [
          { id: batchId },
          { batchNumber: batchId },
          { status: "AT_GATE" }
        ]
      },
      orderBy: { createdAt: "desc" },
    })

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found. Weigh it at the gate first." },
        { status: 400 }
      )
    }

    // Create warehouse entry
    const warehouseEntry = await prisma.warehouseEntry.create({
      data: {
        batchId: batch.id,
        warehouseNumber: `WH-${Date.now()}`,
        entryType: entryTypeValue,
        storageLocations: normalizedLocations,
        arrivalWeightKg: parsedWeight,
        bags: parsedBags,
        notes: notes || null,
        receivedBy: user.id,
      },
    })

    let newStatus: BatchStatus | undefined
    if (entryTypeValue === WarehouseEntryType.ARRIVAL) {
      newStatus = BatchStatus.AT_WAREHOUSE
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
      },
    })

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
          receivedWeight: parsedWeight,
          bags: parsedBags,
          notes,
        }),
      },
    })

    return NextResponse.json({ success: true, warehouseEntry }, { status: 201 })
  } catch (error) {
    console.error("Failed to receive batch:", error)
    return NextResponse.json(
      { error: "Failed to receive batch" },
      { status: 500 }
    )
  }
}

