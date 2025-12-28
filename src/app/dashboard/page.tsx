import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { RoleDashboard } from "@/components/dashboard/role-dashboards"
import { getSettings } from "@/lib/settings"

export default async function DashboardPage() {
  const user = await requireAuth()

  // Optimized data fetching - only load what's necessary with limits and selective fields
  const [
    batches,
    warehouseEntries,
    qualityChecks,
    processingRuns,
    contracts,
    todayWarehouseEntries,
    recentActivity,
    weighingRecords,
    additionalCosts,
    settings,
    processingCosts,
    storageCosts
  ] = await Promise.all([
    prisma.batch.findMany({
      take: 100,
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.warehouseEntry.findMany({
      take: 100,
      include: { batch: true },
      orderBy: { arrivalTimestamp: "desc" },
    }),
    prisma.qualityCheck.findMany({
      take: 50,
      orderBy: { timestamp: "desc" },
    }),
    prisma.processingRun.findMany({
      take: 50,
      include: { 
        inputBatches: {
          take: 10
        }, 
        outputBatches: {
          take: 10
        }
      },
      orderBy: { startTime: "desc" },
    }),
    prisma.contract.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    prisma.warehouseEntry.findMany({
      where: {
        arrivalTimestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.auditLog.findMany({
      include: { 
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
    prisma.vehicleWeighingRecord.findMany({
      take: 50,
      include: {
        batch: {
          include: {
            supplier: true
          }
        }
      },
      orderBy: { timestampIn: "desc" },
    }),
    prisma.additionalCost.findMany({
      take: 50,
      orderBy: { recordedAt: "desc" },
    }),
    getSettings(),
    prisma.processingCost.findMany({
      take: 50,
      orderBy: { createdAt: "desc" }
    }),
    prisma.storageCost.findMany({
      take: 50,
      orderBy: { createdAt: "desc" }
    })
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name || 'User'}. Here's your overview.
        </p>
      </div>
      <RoleDashboard role={user.role} data={{
        batches,
        warehouseEntries,
        qualityChecks,
        processingRuns,
        contracts,
        todayWarehouseEntries,
        recentActivity,
        weighingRecords,
        additionalCosts,
        processingCosts,
        storageCosts,
        exchangeRate: settings.exchangeRate
      }} />
    </div>
  )
}
