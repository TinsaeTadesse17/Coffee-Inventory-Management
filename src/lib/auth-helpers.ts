import { auth } from "./auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireRoles(allowedRoles: Role[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role) && user.role !== "ADMIN") {
    redirect("/unauthorized")
  }
  
  return user
}

export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    CEO: "CEO",
    PURCHASING: "Purchasing",
    SECURITY: "Security",
    QUALITY: "Quality Control",
    WAREHOUSE: "Warehouse Manager",
    PLANT_MANAGER: "Plant Manager",
    EXPORT_MANAGER: "Export Manager",
    FINANCE: "Finance",
    ADMIN: "Administrator",
  }
  return displayNames[role] || role
}

