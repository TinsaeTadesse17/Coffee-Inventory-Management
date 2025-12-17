import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewQCCheckButton } from "@/components/quality/new-qc-check-button"
import { prisma } from "@/lib/prisma"
import { format, formatDistanceToNow } from "date-fns"

export default async function QualityPage() {
  const user = await requireRoles(["QUALITY", "CEO", "ADMIN"])

  // Fetch recent QC checks
  const recentChecks = await prisma.qualityCheck.findMany({
    include: {
      batch: {
        include: {
          supplier: true,
        },
      },
      inspector: true,
    },
    orderBy: {
      timestamp: "desc",
    },
    take: 20,
  })

  // Calculate stats
  const avgCupScore = recentChecks.length > 0
    ? recentChecks.reduce((sum, check) => sum + (check.totalScore || 0), 0) / recentChecks.length
    : 0

  const highScoringCount = recentChecks.filter((check) => (check.totalScore || 0) >= 85).length
  const uniqueOrigins = new Set(recentChecks.map((check) => check.origin).filter(Boolean)).size

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
          <p className="text-muted-foreground">QC inspections and sample management</p>
        </div>
        <NewQCCheckButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Cup Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCupScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{recentChecks.length} sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Exceptional Lots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highScoringCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Score ≥ 85</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unique Origins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueOrigins}</div>
            <p className="text-xs text-muted-foreground mt-1">Across latest tastings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent QC Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {recentChecks.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No quality checks yet. Record your first QC check.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Checkpoint</th>
                    <th className="px-4 py-3">Session</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Roast</th>
                    <th className="px-4 py-3">Fragrance</th>
                    <th className="px-4 py-3">Flavor</th>
                    <th className="px-4 py-3">Acidity</th>
                    <th className="px-4 py-3">Body</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Inspector</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChecks.map((check) => (
                    <tr key={check.id} className="border-b">
                      <td className="px-4 py-3 font-medium">
                        <div>{check.batch.batchNumber}</div>
                        <p className="text-xs text-muted-foreground">{check.batch.supplier?.name || 'Unknown'}</p>
                      </td>
                      <td className="px-4 py-3">{check.checkpoint}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{check.sessionName}</div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(check.sessionDate), "PP")}
                        </p>
                      </td>
                      <td className="px-4 py-3">{check.origin || "-"}</td>
                      <td className="px-4 py-3">{check.roastProfile || "-"}</td>
                      <td className="px-4 py-3">{check.fragranceScore?.toFixed(1) || "-"}</td>
                      <td className="px-4 py-3">{check.flavorScore?.toFixed(1) || "-"}</td>
                      <td className="px-4 py-3">{check.acidityScore?.toFixed(1) || "-"}</td>
                      <td className="px-4 py-3">{check.bodyScore?.toFixed(1) || "-"}</td>
                      <td className="px-4 py-3 font-semibold">{check.totalScore?.toFixed(2) || "-"}</td>
                      <td className="px-4 py-3">{check.inspector.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(check.timestamp), { addSuffix: true })}
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
