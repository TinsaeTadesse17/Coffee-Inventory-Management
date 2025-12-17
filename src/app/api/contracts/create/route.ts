import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PaymentMethod, Role } from "@prisma/client"
import { notifyApprovalRequest } from "@/lib/notification-service"
import { generateId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user
    if (user.role !== Role.EXPORT_MANAGER && user.role !== Role.ADMIN && user.role !== Role.CEO) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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
        contractNumber: generateId("CON"),
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

    // Notify CEO that contract needs approval
    const { notifyByRole } = await import("@/lib/notification-service")
    await notifyByRole({
      role: Role.CEO,
      type: "APPROVAL_REQUEST",
      title: "Contract Approval Requested",
      message: `Contract ${contract.contractNumber} for ${buyerName} (${parsedQuantity}kg) requires your approval`,
      link: `/export?contractId=${contract.id}`,
    })

    return NextResponse.json({ success: true, contract }, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create contract:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create contract" },
      { status: 500 }
    )
  }
}
