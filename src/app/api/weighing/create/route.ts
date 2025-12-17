import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyBatchReady } from "@/lib/notification-service"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { batchId, grossWeight, tareWeight, driverName } = data

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      )
    }

    const netWeight = grossWeight - tareWeight

    // Find the specific batch that's ordered (ready for weighing)
    const batch = await prisma.batch.findFirst({
      where: { 
        OR: [
          { id: batchId },
          { batchNumber: batchId }
        ],
        status: "ORDERED"
      },
    })

    if (!batch) {
      return NextResponse.json(
        { error: `Batch not found or not in ORDERED status. Please select a valid purchased batch.` },
        { status: 400 }
      )
    }

    // Create weighing record (store driver name in notes if provided)
    const weighingRecord = await prisma.vehicleWeighingRecord.create({
      data: {
        batchId: batch.id,
        vehiclePlate: data.vehiclePlate,
        grossWeightIn: grossWeight,
        tareWeight: tareWeight,
        netWeight: netWeight,
        recordedBy: session.user.id,
        notes: driverName ? `Driver: ${driverName}` : undefined,
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

    // Notify Warehouse team that batch is ready for receipt
    try {
      await notifyBatchReady({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        nextRole: Role.WAREHOUSE,
        stepName: "Warehouse Receipt",
      })
    } catch (notifyError) {
      console.error("Failed to send notification:", notifyError)
      // Continue execution
    }

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "VehicleWeighingRecord",
          entityId: weighingRecord.id,
          action: "CREATE_WEIGHING_RECORD",
          changes: JSON.stringify({ netWeight, ...data }),
        },
      })
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError)
      // Continue execution
    }

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

