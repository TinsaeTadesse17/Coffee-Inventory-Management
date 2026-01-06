import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET single batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        supplier: true,
        thirdPartyEntity: true
      }
    })

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    return NextResponse.json(batch)
  } catch (error) {
    console.error("Failed to fetch batch:", error)
    return NextResponse.json({ error: "Failed to fetch batch" }, { status: 500 })
  }
}

// PATCH - Update batch
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN can edit batches
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    // Get original batch data for audit log
    const originalBatch = await prisma.batch.findUnique({
      where: { id }
    })

    if (!originalBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Prepare update data - only include changed fields
    const updateData: any = {}
    const allowedFields = [
      'origin', 'grade', 'variety', 'processingType', 
      'purchasedQuantityKg', 'currentQuantityKg', 'purchaseCost',
      'purchaseCurrency', 'exchangeRateAtPurchase', 'containerCount',
      'status', 'currentLocation'
    ]

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    })

    // Update batch
    const updatedBatch = await prisma.batch.update({
      where: { id },
      data: updateData
    })

    // Create detailed audit log
    const changes: any = {
      before: {},
      after: {}
    }

    Object.keys(updateData).forEach(key => {
      if (originalBatch[key] !== updatedBatch[key]) {
        changes.before[key] = originalBatch[key]
        changes.after[key] = updatedBatch[key]
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "Batch",
        entityId: id,
        action: "UPDATE_BATCH",
        changes: JSON.stringify({
          batchNumber: originalBatch.batchNumber,
          ...changes
        }),
      }
    })

    return NextResponse.json({ success: true, batch: updatedBatch })
  } catch (error) {
    console.error("Failed to update batch:", error)
    return NextResponse.json({ error: "Failed to update batch" }, { status: 500 })
  }
}

