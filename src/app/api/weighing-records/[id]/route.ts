import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "CEO", "SECURITY"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: recordId } = await params
    const data = await request.json()

    const existingRecord = await prisma.vehicleWeighingRecord.findUnique({
      where: { id: recordId },
    })

    if (!existingRecord) {
      return NextResponse.json({ error: "Weighing record not found" }, { status: 404 })
    }

    const oldData = { ...existingRecord }
    
    const updatedRecord = await prisma.vehicleWeighingRecord.update({
      where: { id: recordId },
      data: {
        vehiclePlate: data.vehiclePlate,
        grossWeightIn: data.grossWeightIn ? parseFloat(data.grossWeightIn) : existingRecord.grossWeightIn,
        tareWeight: data.tareWeight ? parseFloat(data.tareWeight) : null,
        netWeight: data.netWeight ? parseFloat(data.netWeight) : null,
        notes: data.notes,
      },
    })

    // Log the change
    const changes: Record<string, any> = {}
    for (const key in data) {
      if (data[key] !== (oldData as any)[key]) {
        changes[key] = { from: (oldData as any)[key], to: data[key] }
      }
    }

    if (Object.keys(changes).length > 0) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "VehicleWeighingRecord",
          entityId: updatedRecord.id,
          action: "UPDATE",
          beforeData: JSON.stringify(oldData),
          afterData: JSON.stringify(updatedRecord),
          changes: JSON.stringify(changes),
        },
      })
    }

    return NextResponse.json({ success: true, weighingRecord: updatedRecord })
  } catch (error) {
    console.error("Failed to update weighing record:", error)
    return NextResponse.json({ error: "Failed to update weighing record" }, { status: 500 })
  }
}

