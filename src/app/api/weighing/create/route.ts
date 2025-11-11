import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const netWeight = data.grossWeight - data.tareWeight

    // Find a batch that's ordered (ready for weighing)
    const batch = await prisma.batch.findFirst({
      where: { status: "ORDERED" },
      orderBy: { createdAt: "desc" },
    })

    if (!batch) {
      // Count total batches to give better error message
      const totalBatches = await prisma.batch.count()
      const orderedBatches = await prisma.batch.count({ where: { status: "ORDERED" } })
      
      return NextResponse.json(
        { error: `No ORDERED batches available for weighing. Total batches: ${totalBatches}, ORDERED batches: ${orderedBatches}. Create a purchase order first.` },
        { status: 400 }
      )
    }

    // Create weighing record (store driver name in notes if provided)
    const weighingRecord = await prisma.vehicleWeighingRecord.create({
      data: {
        batchId: batch.id,
        vehiclePlate: data.vehiclePlate,
        grossWeightIn: data.grossWeight,
        tareWeight: data.tareWeight,
        netWeight: netWeight,
        recordedBy: session.user.id,
        notes: data.driverName ? `Driver: ${data.driverName}` : undefined,
      },
    })

    // Update batch status
    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        status: "AT_GATE",
        currentLocation: "Gate - Security Checkpoint",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "VehicleWeighingRecord",
        entityId: weighingRecord.id,
        action: "CREATE_WEIGHING_RECORD",
        changes: JSON.stringify({ netWeight, ...data }),
      },
    })

    return NextResponse.json({ success: true, weighingRecord, netWeight }, { status: 201 })
  } catch (error) {
    console.error("Failed to create weighing record:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create weighing record"
    console.error("Error details:", errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

