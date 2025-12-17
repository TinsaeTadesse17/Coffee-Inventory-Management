
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow managers to add costs
    const allowedRoles: Role[] = [Role.PURCHASING, Role.FINANCE, Role.CEO, Role.ADMIN, Role.PLANT_MANAGER, Role.EXPORT_MANAGER, Role.WAREHOUSE]
    if (!allowedRoles.includes(session.user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    const { costType, description, amount, batchId } = data

    if (!costType || !amount || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const cost = await prisma.additionalCost.create({
      data: {
        costType,
        description,
        amount: parseFloat(amount),
        batch: batchId ? { connect: { id: batchId } } : undefined,
        recordedByUser: { connect: { id: session.user.id } },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "AdditionalCost",
        entityId: cost.id,
        action: "CREATE_COST",
        changes: JSON.stringify(data),
      },
    })

    return NextResponse.json({ success: true, cost }, { status: 201 })
  } catch (error) {
    console.error("Failed to create additional cost:", error)
    return NextResponse.json(
      { error: "Failed to create additional cost" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const costs = await prisma.additionalCost.findMany({
      include: {
        recordedByUser: {
          select: { name: true }
        },
        batch: {
          select: { batchNumber: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json(costs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch costs" }, { status: 500 })
  }
}
