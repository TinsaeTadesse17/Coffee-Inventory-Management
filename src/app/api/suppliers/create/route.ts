import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notifyBatchReady } from "@/lib/notification-service"
import { Role } from "@prisma/client"
import { generateId } from "@/lib/utils"
import { getSettings } from "@/lib/settings"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Find existing supplier or create new one
    let supplier = await prisma.supplier.findFirst({
      where: {
        name: data.supplierName,
        origin: data.origin,
      },
    })

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: data.supplierName,
          origin: data.origin,
          phone: "",
          email: "",
        },
      })
    }

    // Get current exchange rate
    const settings = await getSettings()

        // Validate input data
    const quantity = Number(data.quantity)
    const pricePerKg = Number(data.pricePerKg)

    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    if (isNaN(pricePerKg) || pricePerKg < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    // Create batch with purchase order
    const batch = await prisma.batch.create({
      data: {
        batchNumber: generateId("BTH"),
        supplierId: supplier.id,
        origin: data.origin,
        purchaseDate: new Date(),
        purchasedQuantityKg: quantity,
        currentQuantityKg: quantity,
        purchaseCost: pricePerKg * quantity,
        status: "ORDERED",
        processingType: data.processType || "NATURAL",
        grade: data.grade,
        exchangeRateAtPurchase: settings?.exchangeRate || 120,
      }
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: "Batch",
          entityId: batch.id,
          action: "CREATE_PURCHASE_ORDER",
          changes: JSON.stringify(data),
        },
      })
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError)
      // Continue execution, don't fail the request
    }

    // Notify Security team that batch is ready for weighing
    try {
      await notifyBatchReady({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        nextRole: Role.SECURITY,
        stepName: "Weighing at Gate",
      })
    } catch (notifyError) {
      console.error("Failed to send notification:", notifyError)
      // Continue execution, don't fail the request
    }

    return NextResponse.json({ success: true, batch }, { status: 201 })
  } catch (error) {
    console.error("Failed to create purchase order:", error)
    // If batch was created but something else failed, we might want to handle that differently
    // But here we are in the top level catch, so likely batch creation failed if we are here
    // unless the try/catches above didn't catch everything.
    
    // Ensure we return a valid JSON error object
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create purchase order" },
      { status: 500 }
    )
  }
}

