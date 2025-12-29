import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewWeighingRecordButton } from "@/components/weighing/new-weighing-record-button"
import { WeighingRecordsClient } from "@/components/weighing/weighing-records-client"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export default async function WeighingPage() {
  const user = await requireRoles(["SECURITY", "CEO", "ADMIN"])

  // Fetch recent weighing records
  const recentWeighings = await prisma.vehicleWeighingRecord.findMany({
    include: {
      batch: {
        include: {
          supplier: true,
        },
      },
    },
    orderBy: {
      timestampIn: "desc",
    },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weighing Room</h1>
          <p className="text-muted-foreground">Security checkpoint - vehicle weighing</p>
        </div>
        <NewWeighingRecordButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Weighing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWeighings.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No weighing records yet. Record the first vehicle.
            </div>
          ) : (
            <WeighingRecordsClient initialRecords={recentWeighings} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
