import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "CEO", "PLANT_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: runId } = await params
    const data = await request.json()

    const existingRun = await prisma.processingRun.findUnique({
      where: { id: runId },
    })

    if (!existingRun) {
      return NextResponse.json({ error: "Processing run not found" }, { status: 404 })
    }

    const oldData = { ...existingRun }
    
    const updatedRun = await prisma.processingRun.update({
      where: { id: runId },
      data: {
        runNumber: data.runNumber,
        yieldRatio: data.yieldRatio ? parseFloat(data.yieldRatio) : null,
        exportQuantity: data.exportQuantity ? parseFloat(data.exportQuantity) : null,
        rejectQuantity: data.rejectQuantity ? parseFloat(data.rejectQuantity) : null,
        jotbagQuantity: data.jotbagQuantity ? parseFloat(data.jotbagQuantity) : null,
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
          entity: "ProcessingRun",
          entityId: updatedRun.id,
          action: "UPDATE",
          beforeData: JSON.stringify(oldData),
          afterData: JSON.stringify(updatedRun),
          changes: JSON.stringify(changes),
        },
      })
    }

    return NextResponse.json({ success: true, processingRun: updatedRun })
  } catch (error) {
    console.error("Failed to update processing run:", error)
    return NextResponse.json({ error: "Failed to update processing run" }, { status: 500 })
  }
}

