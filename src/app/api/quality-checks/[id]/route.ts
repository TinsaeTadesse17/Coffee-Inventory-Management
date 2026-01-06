import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: checkId } = await params
    const data = await request.json()

    const existingCheck = await prisma.qualityCheck.findUnique({
      where: { id: checkId },
    })

    if (!existingCheck) {
      return NextResponse.json({ error: "Quality check not found" }, { status: 404 })
    }

    const oldData = { ...existingCheck }
    
    const updatedCheck = await prisma.qualityCheck.update({
      where: { id: checkId },
      data: {
        sessionName: data.sessionName,
        sessionDate: data.sessionDate ? new Date(data.sessionDate) : existingCheck.sessionDate,
        checkpoint: data.checkpoint,
        origin: data.origin,
        roastProfile: data.roastProfile,
        fragranceScore: data.fragranceScore ? parseFloat(data.fragranceScore) : null,
        flavorScore: data.flavorScore ? parseFloat(data.flavorScore) : null,
        acidityScore: data.acidityScore ? parseFloat(data.acidityScore) : null,
        bodyScore: data.bodyScore ? parseFloat(data.bodyScore) : null,
        totalScore: data.totalScore ? parseFloat(data.totalScore) : null,
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
          entity: "QualityCheck",
          entityId: updatedCheck.id,
          action: "UPDATE",
          beforeData: JSON.stringify(oldData),
          afterData: JSON.stringify(updatedCheck),
          changes: JSON.stringify(changes),
        },
      })
    }

    return NextResponse.json({ success: true, qualityCheck: updatedCheck })
  } catch (error) {
    console.error("Failed to update quality check:", error)
    return NextResponse.json({ error: "Failed to update quality check" }, { status: 500 })
  }
}

