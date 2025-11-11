import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReceiveBatchButton } from "@/components/warehouse/receive-batch-button"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export default async function WarehousePage() {
  const user = await requireRoles(["WAREHOUSE", "CEO", "ADMIN"])

  // Fetch recent warehouse entries
  const recentEntries = await prisma.warehouseEntry.findMany({
    include: {
      batch: {
        include: {
          supplier: true,
        },
      },
    },
    orderBy: {
      arrivalTimestamp: "desc",
    },
    take: 20,
  })

  // Fetch recent weighing records - show all recent ones
  const allWeighingRecords = await prisma.vehicleWeighingRecord.findMany({
    include: {
      batch: {
        include: {
          supplier: true,
          warehouseEntries: {
            select: {
              id: true,
            },
          },
        },
      },
      recordedByUser: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      timestampIn: "desc",
    },
    take: 50,
  })

  // Show all recent weighing records, but prioritize those that haven't been received
  // Mark each record with whether it's been received
  const recentWeighingRecords = allWeighingRecords.map((record) => ({
    ...record,
    isPendingReceipt: record.batch.warehouseEntries.length === 0,
  })).sort((a, b) => {
    // Sort: pending receipts first, then by timestamp
    if (a.isPendingReceipt && !b.isPendingReceipt) return -1
    if (!a.isPendingReceipt && b.isPendingReceipt) return 1
    return new Date(b.timestampIn).getTime() - new Date(a.timestampIn).getTime()
  }).slice(0, 20) // Show top 20

  // Calculate stats
  const totalStock = recentEntries.reduce((sum, entry) => sum + entry.arrivalWeightKg, 0)
  const uniqueLocations = new Set(
    recentEntries.flatMap(e => (e.storageLocations ?? [])).filter(Boolean)
  )
  
  // Count aging batches (>60 days)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const agingBatches = recentEntries.filter(e => 
    new Date(e.arrivalTimestamp) < sixtyDaysAgo
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
          <p className="text-muted-foreground">Stock management and arrivals</p>
        </div>
        <ReceiveBatchButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toFixed(2)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">{recentEntries.length} entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aging (&gt;60 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agingBatches} batches</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueLocations.size}</div>
            <p className="text-xs text-muted-foreground mt-1">active locations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Warehouse Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No warehouse entries yet. Receive a batch to get started.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Warehouse #</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Locations</th>
                    <th className="px-4 py-3">Weight (kg)</th>
                    <th className="px-4 py-3">Bags</th>
                    <th className="px-4 py-3">Moisture %</th>
                    <th className="px-4 py-3">Temp °C</th>
                    <th className="px-4 py-3">Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{entry.warehouseNumber}</td>
                      <td className="px-4 py-3">{entry.batch.batchNumber}</td>
                      <td className="px-4 py-3">{entry.batch.supplier.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded bg-muted text-xs font-semibold uppercase tracking-wide">
                          {entry.entryType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {entry.storageLocations && entry.storageLocations.length > 0
                          ? entry.storageLocations.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold">{entry.arrivalWeightKg.toFixed(2)}</td>
                      <td className="px-4 py-3">{entry.bags ?? "-"}</td>
                      <td className="px-4 py-3">{entry.moisturePercent?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3">{entry.temperatureCelsius?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.arrivalTimestamp), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Weighing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWeighingRecords.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No weighing records found. Batches must be weighed at the gate first before warehouse receipt.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Vehicle Plate</th>
                    <th className="px-4 py-3">Net Weight (kg)</th>
                    <th className="px-4 py-3">Gross Weight In (kg)</th>
                    <th className="px-4 py-3">Weighed By</th>
                    <th className="px-4 py-3">Weighed At</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWeighingRecords.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{record.batch.batchNumber}</td>
                      <td className="px-4 py-3">{record.batch.supplier.name}</td>
                      <td className="px-4 py-3">{record.vehiclePlate}</td>
                      <td className="px-4 py-3 font-semibold">
                        {record.netWeight ? record.netWeight.toFixed(2) : "N/A"}
                      </td>
                      <td className="px-4 py-3">{record.grossWeightIn.toFixed(2)}</td>
                      <td className="px-4 py-3">{record.recordedByUser?.name || "N/A"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(record.timestampIn), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          (record as any).isPendingReceipt
                            ? "bg-amber-100 text-amber-800 font-medium" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {(record as any).isPendingReceipt ? "Pending Receipt" : "Received"}
                        </span>
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
