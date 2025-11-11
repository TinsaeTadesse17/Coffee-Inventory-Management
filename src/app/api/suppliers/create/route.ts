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

    // Create batch with purchase order
    const batch = await prisma.batch.create({
      data: {
        batchNumber: `BTH-${Date.now()}`,
        supplierId: supplier.id,
        origin: data.origin,
        purchaseDate: new Date(),
        purchasedQuantityKg: data.quantityKg,
        purchaseCost: data.quantityKg * data.pricePerKg,
        purchaseCurrency: "ETB",
        status: "ORDERED",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "Batch",
        entityId: batch.id,
        action: "CREATE_PURCHASE_ORDER",
        changes: JSON.stringify(data),
      },
    })

    return NextResponse.json({ success: true, batch }, { status: 201 })
  } catch (error) {
    console.error("Failed to create purchase order:", error)
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    )
  }
}

