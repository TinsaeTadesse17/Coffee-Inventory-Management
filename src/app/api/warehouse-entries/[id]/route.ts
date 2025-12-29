import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "CEO", "WAREHOUSE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: entryId } = await params
    const data = await request.json()

    const existingEntry = await prisma.warehouseEntry.findUnique({
      where: { id: entryId },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: "Warehouse entry not found" }, { status: 404 })
    }

    const oldData = { ...existingEntry }
    
    const updatedEntry = await prisma.warehouseEntry.update({
      where: { id: entryId },
      data: {
        warehouseNumber: data.warehouseNumber,
        entryType: data.entryType,
        storageLocations: data.storageLocations || [],
        arrivalWeightKg: data.arrivalWeightKg ? parseFloat(data.arrivalWeightKg) : existingEntry.arrivalWeightKg,
        bags: data.bags ? parseInt(data.bags) : null,
        moisturePercent: data.moisturePercent ? parseFloat(data.moisturePercent) : null,
        temperatureCelsius: data.temperatureCelsius ? parseFloat(data.temperatureCelsius) : null,
        notes: data.notes,
      },
    })

    // Log the change
    const changes: Record<string, any> = {}
    for (const key in data) {
      if (JSON.stringify(data[key]) !== JSON.stringify((oldData as any)[key])) {
        changes[key] = { from: (oldData as any)[key], to: data[key] }
      }
    }

    if (Object.keys(changes).length > 0) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "WarehouseEntry",
          entityId: updatedEntry.id,
          action: "UPDATE",
          beforeData: JSON.stringify(oldData),
          afterData: JSON.stringify(updatedEntry),
          changes: JSON.stringify(changes),
        },
      })
    }

    return NextResponse.json({ success: true, warehouseEntry: updatedEntry })
  } catch (error) {
    console.error("Failed to update warehouse entry:", error)
    return NextResponse.json({ error: "Failed to update warehouse entry" }, { status: 500 })
  }
}

