import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const { email, password } = credentials as { email: string; password: string }

        const user = await prisma.user.findUnique({
          where: {
            email
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        if (!user.active) {
          throw new Error("Account is deactivated")
        }

        const isCorrectPassword = await bcrypt.compare(
          password,
          user.password
        )

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        
        // Track login in audit log for session tracking
        if (user.id) {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              entity: "Session",
              entityId: user.id,
              action: "LOGIN",
              changes: JSON.stringify({ email: user.email })
            }
          }).catch(() => {}) // Silently fail if audit log fails
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as Role
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
}

// Permission system
export const permissions = {
  CEO: {
    viewAll: true,
    approveContracts: true,
    setPrice: true,
    editOther: false,
  },
  PURCHASING: {
    createPurchases: true,
    viewSuppliers: true,
    viewFinanceAfterQC: true,
  },
  SECURITY: {
    createWeighings: true,
    uploadAuthorityDocs: true,
  },
  QUALITY: {
    createQC: true,
    manageSamples: true,
    sendPSS: true,
  },
  WAREHOUSE: {
    receiveBatches: true,
    moveStock: true,
    viewAging: true,
  },
  PLANT_MANAGER: {
    scheduleProcessing: true,
    acceptProcessingRequests: true,
  },
  EXPORT_MANAGER: {
    createContracts: true,
    requestProcessing: true,
    manageShipments: true,
  },
  FINANCE: {
    viewPayments: true,
    markPayments: true,
    uploadReceipts: true,
  },
  ADMIN: {
    manageUsers: true,
    viewAuditLogs: true,
    systemSettings: true,
    fullAccess: true,
  },
}

export function hasPermission(userRole: Role, permission: string): boolean {
  const rolePermissions = permissions[userRole] as any
  return rolePermissions?.[permission] === true || rolePermissions?.fullAccess === true
}

export function requireRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole) || userRole === "ADMIN"
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

