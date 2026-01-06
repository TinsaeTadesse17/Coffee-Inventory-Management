import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// PATCH - Update contract
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN can edit contracts
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    // Get original contract data for audit log
    const originalContract = await prisma.contract.findUnique({
      where: { id }
    })

    if (!originalContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    const allowedFields = [
      'buyer', 'buyerEmail', 'destinationCountry', 'coffeeType',
      'gradeSpec', 'quantityKg', 'pricePerKg', 'priceCurrency',
      'exchangeRateAtExport', 'shippingDate', 'paymentMethod'
    ]

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'shippingDate' && data[field]) {
          updateData[field] = new Date(data[field])
        } else {
          updateData[field] = data[field]
        }
      }
    })

    // Update contract
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: updateData
    })

    // Create detailed audit log
    const changes: any = {
      before: {},
      after: {}
    }

    Object.keys(updateData).forEach(key => {
      if (JSON.stringify(originalContract[key]) !== JSON.stringify(updatedContract[key])) {
        changes.before[key] = originalContract[key]
        changes.after[key] = updatedContract[key]
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "Contract",
        entityId: id,
        action: "UPDATE_CONTRACT",
        changes: JSON.stringify({
          contractNumber: originalContract.contractNumber,
          ...changes
        }),
      }
    })

    return NextResponse.json({ success: true, contract: updatedContract })
  } catch (error) {
    console.error("Failed to update contract:", error)
    return NextResponse.json({ error: "Failed to update contract" }, { status: 500 })
  }
}

// GET contract details
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
    const contract = await prisma.contract.findUnique({
      where: { id }
    })

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error("Failed to fetch contract:", error)
    return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 })
  }
}

