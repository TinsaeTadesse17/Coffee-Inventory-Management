import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { name, email, role, active, password } = data

    // Get original user data for audit log
    const originalUser = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, role: true, active: true }
    })

    if (!originalUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (active !== undefined) updateData.active = active
    if (password) {
      updateData.password = await hash(password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "User",
        entityId: id,
        action: "UPDATE_USER",
        changes: JSON.stringify({
          before: originalUser,
          after: {
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            active: updatedUser.active
          },
          passwordChanged: !!password
        }),
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE user (deactivate)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Deactivate instead of delete
    const user = await prisma.user.update({
      where: { id },
      data: { active: false }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: "User",
        entityId: id,
        action: "DEACTIVATE_USER",
        changes: JSON.stringify({ email: user.email }),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to deactivate user:", error)
    return NextResponse.json({ error: "Failed to deactivate user" }, { status: 500 })
  }
}

