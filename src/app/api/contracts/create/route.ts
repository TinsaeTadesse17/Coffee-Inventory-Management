import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRoles } from "@/lib/auth-helpers"
import { PaymentMethod, Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const user = await requireRoles([Role.EXPORT_MANAGER, Role.ADMIN])

    const data = await request.json()

    const {
      buyerName,
      buyerEmail,
      destinationCountry,
      coffeeType,
      gradeSpec,
      quantityKg,
      pricePerKg,
      shippingDate,
      paymentMethod,
    } = data

    if (!buyerName || !destinationCountry || !coffeeType) {
      return NextResponse.json({ error: "Buyer name, destination, and coffee type are required." }, { status: 400 })
    }

    const parsedQuantity = Number(quantityKg)
    const parsedPrice = pricePerKg !== undefined && pricePerKg !== null ? Number(pricePerKg) : null

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number." }, { status: 400 })
    }

    if (parsedPrice !== null && parsedPrice <= 0) {
      return NextResponse.json({ error: "Price per kg must be greater than zero." }, { status: 400 })
    }

    let shippingDateValue: Date | null = null
    if (shippingDate) {
      const parsed = new Date(shippingDate)
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Invalid shipping date." }, { status: 400 })
      }
      shippingDateValue = parsed
    }

    const paymentMethodValue =
      typeof paymentMethod === "string"
        ? paymentMethod.toUpperCase()
        : PaymentMethod.TT

    if (!Object.values(PaymentMethod).includes(paymentMethodValue as PaymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method." }, { status: 400 })
    }

    // Create contract (pending CEO approval)
    const contract = await prisma.contract.create({
      data: {
        contractNumber: `CNT-${Date.now()}`,
        buyer: buyerName,
        buyerEmail: buyerEmail || null,
        destinationCountry,
        coffeeType,
        gradeSpec: gradeSpec || null,
        quantityKg: parsedQuantity,
        pricePerKg: parsedPrice,
        priceCurrency: "USD",
        shippingDate: shippingDateValue,
        paymentMethod: paymentMethodValue as PaymentMethod,
        approvalStatus: "PENDING",
        createdBy: user.id,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        entity: "Contract",
        entityId: contract.id,
        action: "CREATE_CONTRACT",
        changes: JSON.stringify(data),
      },
    })

    return NextResponse.json({ success: true, contract }, { status: 201 })
  } catch (error) {
    console.error("Failed to create contract:", error)
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    )
  }
}
