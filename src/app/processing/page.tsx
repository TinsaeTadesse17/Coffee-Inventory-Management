import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { NewProcessingRunButton } from "@/components/processing/new-processing-run-button"
import { ProcessingRunsClient } from "@/components/processing/processing-runs-client"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { formatNumber, formatWeight } from "@/lib/format-utils"

export default async function ProcessingPage() {
  const user = await requireRoles(["PLANT_MANAGER", "CEO", "ADMIN"])

  // Fetch recent processing runs - optimized with selective fields
  const recentRuns = await prisma.processingRun.findMany({
    include: {
      inputs: {
        include: {
          batch: {
            select: {
              id: true,
              batchNumber: true
            }
          }
        }
      },
      inputBatches: {
        select: {
          id: true,
          batchNumber: true,
          supplier: {
            select: {
              name: true
            }
          },
          thirdPartyEntity: {
            select: {
              name: true
            }
          },
        },
      },
      processedByUser: {
        select: {
          name: true
        }
      },
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
            <ProcessingRunsClient initialRuns={recentRuns} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
