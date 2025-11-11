import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { RoleDashboard } from "@/components/dashboard/role-dashboards"

export default async function DashboardPage() {
  const user = await requireAuth()

  // Fetch data based on role
  const [
    batches,
    warehouseEntries,
    qualityChecks,
    processingRuns,
    contracts,
    todayWarehouseEntries,
    recentActivity,
    weighingRecords
  ] = await Promise.all([
    prisma.batch.findMany({
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.warehouseEntry.findMany({
      include: { batch: true },
      orderBy: { arrivalTimestamp: "desc" },
    }),
    prisma.qualityCheck.findMany({
      orderBy: { timestamp: "desc" },
    }),
    prisma.processingRun.findMany({
      include: { inputBatches: true, outputBatches: true },
      orderBy: { startTime: "desc" },
    }),
    prisma.contract.findMany({
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
      include: { user: true },
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
    prisma.vehicleWeighingRecord.findMany({
      orderBy: { timestampIn: "desc" },
    })
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's your overview.
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
        weighingRecords
      }} />
    </div>
  )
}
