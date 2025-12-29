import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !["ADMIN", "CEO", "FINANCE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: costId } = await params
    const data = await request.json()

    const existingCost = await prisma.additionalCost.findUnique({
      where: { id: costId },
    })

    if (!existingCost) {
      return NextResponse.json({ error: "Additional cost not found" }, { status: 404 })
    }

    const oldData = { ...existingCost }
    
    const updatedCost = await prisma.additionalCost.update({
      where: { id: costId },
      data: {
        costType: data.costType,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount) : existingCost.amount,
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
          entity: "AdditionalCost",
          entityId: updatedCost.id,
          action: "UPDATE",
          beforeData: JSON.stringify(oldData),
          afterData: JSON.stringify(updatedCost),
          changes: JSON.stringify(changes),
        },
      })
    }

    return NextResponse.json({ success: true, additionalCost: updatedCost })
  } catch (error) {
    console.error("Failed to update additional cost:", error)
    return NextResponse.json({ error: "Failed to update additional cost" }, { status: 500 })
  }
}

