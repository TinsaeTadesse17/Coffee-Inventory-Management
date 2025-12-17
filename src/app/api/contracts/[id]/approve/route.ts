import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRoles } from "@/lib/auth-helpers"
import { Role } from "@prisma/client"
import { notifyByRole } from "@/lib/notification-service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    await requireRoles([Role.CEO, Role.ADMIN])

    const { action } = await request.json()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      )
    }

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'APPROVE' or 'REJECT'" },
        { status: 400 }
      )
    }

    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    if (contract.approvalStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Contract is not pending approval" },
        { status: 400 }
      )
    }

    const approvalStatus = action === "APPROVE" ? "APPROVED" : "REJECTED"

    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        approvalStatus,
        ceoApprovedBy: action === "APPROVE" ? user.id : null,
        ceoApprovedAt: action === "APPROVE" ? new Date() : null,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        entity: "Contract",
        entityId: contract.id,
        action: action === "APPROVE" ? "APPROVE_CONTRACT" : "REJECT_CONTRACT",
        changes: JSON.stringify({
          previousStatus: contract.approvalStatus,
          newStatus: approvalStatus,
        }),
      },
    })

    // Notify Export Manager about contract approval/rejection
    const creator = await prisma.user.findUnique({
      where: { id: contract.createdBy },
      select: { name: true },
    })

    await notifyByRole({
      role: Role.EXPORT_MANAGER,
      type: action === "APPROVE" ? "CONTRACT_APPROVED" : "GENERAL",
      title: action === "APPROVE" ? "Contract Approved" : "Contract Rejected",
      message: action === "APPROVE"
        ? `Contract ${contract.contractNumber} has been approved by CEO. You can now proceed with shipment.`
        : `Contract ${contract.contractNumber} has been rejected by CEO. Please review and resubmit if needed.`,
      link: `/export?contractId=${contract.id}`,
    })

    return NextResponse.json({ contract: updatedContract })
  } catch (error) {
    console.error("Failed to update contract approval:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update contract approval"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

