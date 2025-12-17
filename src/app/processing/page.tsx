import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { NewProcessingRunButton } from "@/components/processing/new-processing-run-button"
import { CompleteProcessingRunButton } from "@/components/processing/complete-processing-run-button"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { formatNumber, formatWeight } from "@/lib/format-utils"

export default async function ProcessingPage() {
  const user = await requireRoles(["PLANT_MANAGER", "CEO", "ADMIN"])

  // Fetch recent processing runs
  const recentRuns = await prisma.processingRun.findMany({
    include: {
      inputs: {
        include: {
          batch: true
        }
      },
      inputBatches: {
        include: {
          supplier: true,
          thirdPartyEntity: true,
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
  const completedRuns = recentRuns.filter(r => r.endTime !== null && r.yieldRatio !== null)
  
  const avgYield = completedRuns.length > 0
    ? (completedRuns.reduce((sum, run) => sum + (run.yieldRatio || 0), 0) / completedRuns.length) * 100
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
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/processing/queue">View Queue</Link>
          </Button>
          <NewProcessingRunButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(avgYield)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{recentRuns.length} runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reject Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(rejectRate)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{formatWeight(totalReject)} rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(totalExport)}</div>
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
                    <th className="px-4 py-3">Input Batches</th>
                    <th className="px-4 py-3">Yield %</th>
                    <th className="px-4 py-3">Export (kg)</th>
                    <th className="px-4 py-3">Reject (kg)</th>
                    <th className="px-4 py-3">Jotbag (kg)</th>
                    <th className="px-4 py-3">Processed By</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((run) => (
                    <tr key={run.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{run.runNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {run.inputBatches.map((batch) => (
                            <div key={batch.id} className="text-xs">
                              <span className="font-medium">{batch.batchNumber}</span>
                              <span className="text-muted-foreground ml-1">
                                {batch.supplier ? `(${batch.supplier.name})` : batch.thirdPartyEntity ? `(${batch.thirdPartyEntity.name})` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {run.yieldRatio !== null ? `${formatNumber(run.yieldRatio * 100)}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-green-600 font-semibold">
                        {run.exportQuantity ? formatWeight(run.exportQuantity) : '-'}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        {run.rejectQuantity ? formatWeight(run.rejectQuantity) : '-'}
                      </td>
                      <td className="px-4 py-3 text-amber-600">
                        {run.jotbagQuantity ? formatWeight(run.jotbagQuantity) : '-'}
                      </td>
                      <td className="px-4 py-3">{run.processedByUser.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(run.startTime), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        {!run.endTime && (
                          <CompleteProcessingRunButton 
                            runId={run.id} 
                            runNumber={run.runNumber}
                            totalInputWeight={run.inputs.reduce((sum, i) => sum + i.weightUsed, 0)}
                          />
                        )}
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
