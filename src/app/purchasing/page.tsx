import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewPurchaseOrderButton } from "@/components/purchasing/new-purchase-order-button"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"

export default async function PurchasingPage() {
  const user = await requireRoles(["PURCHASING", "CEO", "ADMIN"])

  // Fetch recent batches (purchase orders)
  const recentBatches = await prisma.batch.findMany({
    include: {
      supplier: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchasing</h1>
          <p className="text-muted-foreground">Manage purchase orders and suppliers</p>
        </div>
        <NewPurchaseOrderButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBatches.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No purchase orders yet. Create one to get started.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Batch ID</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Quantity (kg)</th>
                    <th className="px-4 py-3">Cost (ETB)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map((batch) => (
                    <tr key={batch.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{batch.batchNumber}</td>
                      <td className="px-4 py-3">{batch.supplier.name}</td>
                      <td className="px-4 py-3">{batch.origin}</td>
                      <td className="px-4 py-3">{batch.purchasedQuantityKg.toFixed(2)}</td>
                      <td className="px-4 py-3">{batch.purchaseCost.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          batch.status === "ORDERED" ? "bg-blue-100 text-blue-800" :
                          batch.status === "AT_GATE" ? "bg-yellow-100 text-yellow-800" :
                          batch.status === "AT_WAREHOUSE" ? "bg-purple-100 text-purple-800" :
                          batch.status === "STORED" ? "bg-green-100 text-green-800" :
                          batch.status === "PROCESSED" ? "bg-indigo-100 text-indigo-800" :
                          batch.status === "REJECTED" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })}
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
