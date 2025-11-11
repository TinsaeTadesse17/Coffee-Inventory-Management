import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewWeighingRecordButton } from "@/components/weighing/new-weighing-record-button"
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
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Gross (kg)</th>
                    <th className="px-4 py-3">Tare (kg)</th>
                    <th className="px-4 py-3">Net (kg)</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWeighings.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{record.vehiclePlate}</td>
                      <td className="px-4 py-3">{record.notes?.replace('Driver: ', '') || '-'}</td>
                      <td className="px-4 py-3">{record.batch.batchNumber}</td>
                      <td className="px-4 py-3">{record.grossWeightIn.toFixed(2)}</td>
                      <td className="px-4 py-3">{record.tareWeight?.toFixed(2) || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {record.netWeight?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(record.timestampIn), { addSuffix: true })}
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
