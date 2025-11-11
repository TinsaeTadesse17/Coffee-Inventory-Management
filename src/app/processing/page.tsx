import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewProcessingRunButton } from "@/components/processing/new-processing-run-button"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export default async function ProcessingPage() {
  const user = await requireRoles(["PLANT_MANAGER", "CEO", "ADMIN"])

  // Fetch recent processing runs
  const recentRuns = await prisma.processingRun.findMany({
    include: {
      inputBatches: {
        include: {
          supplier: true,
        },
      },
      processedByUser: true,
    },
    orderBy: {
      startTime: "desc",
    },
    take: 20,
  })

  // Calculate stats
  const avgYield = recentRuns.length > 0
    ? (recentRuns.reduce((sum, run) => sum + (run.yieldRatio || 0), 0) / recentRuns.length) * 100
    : 0

  const totalExport = recentRuns.reduce((sum, run) => sum + (run.exportQuantity || 0), 0)
  const totalReject = recentRuns.reduce((sum, run) => sum + (run.rejectQuantity || 0), 0)
  const rejectRate = (totalExport + totalReject) > 0 
    ? (totalReject / (totalExport + totalReject)) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processing</h1>
          <p className="text-muted-foreground">Coffee processing operations</p>
        </div>
        <NewProcessingRunButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgYield.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{recentRuns.length} runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reject Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{totalReject.toFixed(0)} kg rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExport.toFixed(0)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">export grade</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Processing Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRuns.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No processing runs yet. Start your first processing run.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Run Number</th>
                    <th className="px-4 py-3">Batches</th>
                    <th className="px-4 py-3">Yield %</th>
                    <th className="px-4 py-3">Export (kg)</th>
                    <th className="px-4 py-3">Reject (kg)</th>
                    <th className="px-4 py-3">Jotbag (kg)</th>
                    <th className="px-4 py-3">Processed By</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run) => (
                    <tr key={run.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{run.runNumber}</td>
                      <td className="px-4 py-3">{run.inputBatches.length}</td>
                      <td className="px-4 py-3">
                        {run.yieldRatio ? (run.yieldRatio * 100).toFixed(1) : '-'}%
                      </td>
                      <td className="px-4 py-3 text-green-600 font-semibold">
                        {run.exportQuantity?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        {run.rejectQuantity?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-amber-600">
                        {run.jotbagQuantity?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3">{run.processedByUser.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(run.startTime), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
