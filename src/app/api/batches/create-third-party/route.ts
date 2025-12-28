import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateId } from "@/lib/utils"
// import { Role } from "@prisma/client"
import { notifyBatchReady } from "@/lib/notification-service"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Find existing entity or create new one
    let entity = await prisma.thirdPartyEntity.findFirst({
      where: {
        name: data.entityName,
      },
    })

    if (!entity) {
      entity = await prisma.thirdPartyEntity.create({
        data: {
          name: data.entityName,
          contactPerson: data.contactPerson || "",
          phone: data.phone || "",
          email: data.email || "",
        },
      })
    }

    // Get max queue position for active batches
    const maxQueue = await prisma.batch.aggregate({
      _max: { queuePosition: true },
      where: { 
        status: { not: "PROCESSED" } 
      }
    })
    const nextQueue = (maxQueue._max.queuePosition || 0) + 1

    // Validate input data
    const quantityKg = Number(data.quantityKg)
    if (isNaN(quantityKg) || quantityKg <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        batchNumber: generateId("EXT"),
        isThirdParty: true,
        thirdPartyEntityId: entity.id,
        origin: data.origin,
        purchaseDate: new Date(),
        purchasedQuantityKg: quantityKg,
        currentQuantityKg: quantityKg,
        purchaseCost: 0, // No purchase cost for third party
        purchaseCurrency: "ETB",
        status: "ORDERED", // Starts flow here
        queuePosition: nextQueue,
      },
    })

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "Batch",
          entityId: batch.id,
          action: "CREATE_THIRD_PARTY_BATCH",
          changes: JSON.stringify(data),
        },
      })
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError)
    }

    // Notify Security team
    try {
      await notifyBatchReady({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        nextRole: "SECURITY" as any,
        stepName: "Weighing at Gate (Third Party)",
      })
    } catch (notifyError) {
      console.error("Failed to send notification:", notifyError)
    }

    return NextResponse.json({ success: true, batch }, { status: 201 })
  } catch (error) {
    console.error("Failed to create third party batch:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create batch" },
      { status: 500 }
    )
  }
}
