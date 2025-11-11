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

    // Find batch that passed QC
    let batch = await prisma.batch.findFirst({
      where: { 
        OR: [
          { id: data.batchId },
          { batchNumber: data.batchId },
          { status: "STORED" }
        ]
      },
      orderBy: { createdAt: "desc" },
    })

    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found or hasn't passed QC yet." },
        { status: 400 }
      )
    }

    // Calculate processing output (80% for export, 50% for reject)
    const yieldPercentage = data.processType === "EXPORT" ? 80 : 50
    const exportQuantity = data.processType === "EXPORT" ? (data.inputWeight * yieldPercentage) / 100 : 0
    const rejectQuantity = data.processType === "REJECT" ? (data.inputWeight * yieldPercentage) / 100 : 0
    const jotbagQuantity = data.processType === "EXPORT" ? data.inputWeight - exportQuantity : 0

    // Create processing run
    const processingRun = await prisma.processingRun.create({
      data: {
        runNumber: `RUN-${Date.now()}`,
        startTime: new Date(),
        endTime: new Date(),
        yieldRatio: yieldPercentage / 100,
        exportQuantity,
        rejectQuantity,
        jotbagQuantity,
        processedBy: session.user.id,
        notes: `Processing type: ${data.processType}`,
        inputBatches: {
          connect: { id: batch.id }
        },
      },
    })

    // Update batch status
    await prisma.batch.update({
      where: { id: batch.id },
      data: {
        status: data.processType === "EXPORT" ? "PROCESSED" : "REJECTED",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "ProcessingRun",
        entityId: processingRun.id,
        action: "CREATE_PROCESSING_RUN",
        changes: JSON.stringify({ exportQuantity, rejectQuantity, jotbagQuantity, ...data }),
      },
    })

    return NextResponse.json({ 
      success: true, 
      processingRun,
      outputWeight: data.processType === "EXPORT" ? exportQuantity : rejectQuantity,
      yieldPercentage 
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create processing run:", error)
    return NextResponse.json(
      { error: "Failed to create processing run" },
      { status: 500 }
    )
  }
}
