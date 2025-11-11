import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewContractButton } from "@/components/export/new-contract-button"
import { prisma } from "@/lib/prisma"
import { format, formatDistanceToNow } from "date-fns"

export default async function ExportPage() {
  const user = await requireRoles(["EXPORT_MANAGER", "CEO", "ADMIN"])

  // Fetch recent contracts
  const recentContracts = await prisma.contract.findMany({
    include: {
      creator: true,
      approver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })

  // Calculate stats
  const pendingApproval = recentContracts.filter(c => c.approvalStatus === "PENDING").length
  const approved = recentContracts.filter(c => c.approvalStatus === "APPROVED").length
  const totalValue = recentContracts
    .filter(c => c.approvalStatus === "APPROVED")
    .reduce((sum, c) => sum + (c.quantityKg * (c.pricePerKg || 0)), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export & Shipments</h1>
          <p className="text-muted-foreground">Manage contracts and shipments</p>
        </div>
        <NewContractButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approved}</div>
            <p className="text-xs text-muted-foreground mt-1">{recentContracts.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending CEO Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApproval}</div>
            <p className="text-xs text-muted-foreground mt-1">awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">approved contracts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentContracts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No contracts yet. Create your first contract.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Contract #</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Coffee</th>
                    <th className="px-4 py-3">Quantity (kg)</th>
                    <th className="px-4 py-3">Price/kg</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Ship Date</th>
                    <th className="px-4 py-3">Total Value</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((contract) => (
                    <tr key={contract.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{contract.contractNumber}</td>
                      <td className="px-4 py-3">{contract.buyer}</td>
                      <td className="px-4 py-3">
                        <div>{contract.destinationCountry}</div>
                        {contract.buyerEmail && (
                          <p className="text-xs text-muted-foreground">{contract.buyerEmail}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>{contract.coffeeType}</div>
                        {contract.gradeSpec && (
                          <p className="text-xs text-muted-foreground">{contract.gradeSpec}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">{contract.quantityKg.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {contract.priceCurrency} {contract.pricePerKg?.toFixed(2) || '-'}
                      </td>
                      <td className="px-4 py-3">{contract.paymentMethod}</td>
                      <td className="px-4 py-3">
                        {contract.shippingDate
                          ? format(new Date(contract.shippingDate), "PP")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        ${(contract.quantityKg * (contract.pricePerKg || 0)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          contract.approvalStatus === "APPROVED" ? "bg-green-100 text-green-800" :
                          contract.approvalStatus === "REJECTED" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {contract.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })}
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
