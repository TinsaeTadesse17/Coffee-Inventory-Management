import { Role } from "@prisma/client"
import { 
  LayoutDashboard, ShoppingCart, Scale, Warehouse, FlaskConical, 
  Factory, Ship, DollarSign, FileText, Settings
} from "lucide-react"

export const roleNavigation: Record<Role, string[]> = {
  CEO: ["/dashboard", "/export", "/finance"],
  PURCHASING: ["/dashboard", "/purchasing"],
  SECURITY: ["/dashboard", "/weighing"],
  QUALITY: ["/dashboard", "/quality"],
  WAREHOUSE: ["/dashboard", "/warehouse"],
  PLANT_MANAGER: ["/dashboard", "/processing"],
  EXPORT_MANAGER: ["/dashboard", "/export"],
  FINANCE: ["/dashboard", "/finance"],
  ADMIN: ["/dashboard", "/purchasing", "/weighing", "/warehouse", "/quality", "/export", "/processing", "/finance", "/admin"],
}

const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Purchasing", href: "/purchasing", icon: ShoppingCart },
  { name: "Weighing", href: "/weighing", icon: Scale },
  { name: "Warehouse", href: "/warehouse", icon: Warehouse },
  { name: "Quality", href: "/quality", icon: FlaskConical },
  { name: "Export", href: "/export", icon: Ship },
  { name: "Processing", href: "/processing", icon: Factory },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Admin", href: "/admin", icon: Settings },
]

export function getNavigationForRole(role: Role) {
  const allowedPaths = roleNavigation[role]
  return allNavigation.filter(item => allowedPaths.includes(item.href))
}



