import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { DownloadFinancialReportButton } from "@/components/finance/download-financial-report-button"
import { DownloadSupplierLedgerButton } from "@/components/finance/download-supplier-ledger-button"

export default async function FinancePage() {
  const user = await requireRoles(["FINANCE", "CEO", "ADMIN"])

  // Fetch real financial data
  const [batches, contracts, processingRuns, suppliers, warehouseEntries] = await Promise.all([
    prisma.batch.findMany({
      include: { supplier: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contract.findMany({
      include: { creator: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.processingRun.findMany({
      orderBy: { startTime: "desc" },
    }),
    prisma.supplier.findMany(),
    prisma.warehouseEntry.findMany({
      include: {
        batch: {
          include: { supplier: true }
        }
      },
      orderBy: { arrivalTimestamp: "desc" },
      take: 50,
    }),
  ])

  // Calculate Payables (money we owe to suppliers)
  const totalPayables = batches.reduce((sum, batch) => sum + batch.purchaseCost, 0)
  // For simplicity, assume all batches are unpaid (can add payment tracking later)
  const unpaidPayables = totalPayables

  // Calculate Receivables (money customers owe us)
  const approvedContracts = contracts.filter(c => c.approvalStatus === "APPROVED")
  const totalReceivables = approvedContracts.reduce(
    (sum, contract) => sum + (contract.quantityKg * (contract.pricePerKg || 0)), 
    0
  )
  
  // Calculate pending contracts (awaiting CEO approval)
  const pendingContracts = contracts.filter(c => c.approvalStatus === "PENDING")
  const pendingValue = pendingContracts.reduce(
    (sum, contract) => sum + (contract.quantityKg * (contract.pricePerKg || 0)),
    0
  )

  // Calculate inventory value
  const inventoryValue = batches
    .filter(b => ["AT_WAREHOUSE", "STORED", "PROCESSED", "EXPORT_READY"].includes(b.status))
    .reduce((sum, b) => sum + b.purchaseCost, 0)

  // Calculate export value (processed coffee)
  const exportValue = processingRuns.reduce(
    (sum, run) => sum + ((run.exportQuantity || 0) * 8.5), // Assuming avg $8.50/kg
    0
  )

  // Calculate profit margin (simplified)
  const totalCost = totalPayables
  const totalRevenue = totalReceivables
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0

  // Group transactions by supplier for ledger
  const supplierLedger = suppliers.map(supplier => {
    const supplierBatches = batches.filter(b => b.supplierId === supplier.id)
    const totalPurchased = supplierBatches.reduce((sum, b) => sum + b.purchaseCost, 0)
    const totalQuantity = supplierBatches.reduce((sum, b) => sum + b.purchasedQuantityKg, 0)
    const avgPrice = totalQuantity > 0 ? totalPurchased / totalQuantity : 0
    
    return {
      supplier,
      batchCount: supplierBatches.length,
      totalPurchased,
      totalQuantity,
      avgPrice,
      lastPurchase: supplierBatches[0]?.createdAt || null,
    }
  }).filter(s => s.batchCount > 0)
  .sort((a, b) => b.totalPurchased - a.totalPurchased)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Payments and financial tracking</p>
        </div>
        <div className="flex gap-2">
          <DownloadFinancialReportButton />
          <DownloadSupplierLedgerButton />
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ETB {unpaidPayables.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {batches.length} total batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalReceivables.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedContracts.length} approved contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${pendingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingContracts.length} contracts awaiting CEO
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cost (Purchases)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">{batches.length} batches purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Export Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${exportValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {processingRuns.reduce((sum, r) => sum + (r.exportQuantity || 0), 0).toFixed(0)} kg export grade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Profit Margin (Est.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin > 0 ? 'Profitable' : 'Need more sales'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {supplierLedger.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No supplier transactions yet. Create a purchase order to get started.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Batches</th>
                    <th className="px-4 py-3">Total Quantity (kg)</th>
                    <th className="px-4 py-3">Total Paid (ETB)</th>
                    <th className="px-4 py-3">Avg Price/kg</th>
                    <th className="px-4 py-3">Last Purchase</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierLedger.map((entry) => (
                    <tr key={entry.supplier.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{entry.supplier.name}</td>
                      <td className="px-4 py-3">{entry.supplier.origin}</td>
                      <td className="px-4 py-3">{entry.batchCount}</td>
                      <td className="px-4 py-3">{entry.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3 font-semibold text-red-600">
                        {entry.totalPurchased.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3">
                        {entry.avgPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.lastPurchase 
                          ? formatDistanceToNow(new Date(entry.lastPurchase), { addSuffix: true })
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-semibold">
                    <td className="px-4 py-3" colSpan={2}>TOTAL</td>
                    <td className="px-4 py-3">{supplierLedger.reduce((s, e) => s + e.batchCount, 0)}</td>
                    <td className="px-4 py-3">
                      {supplierLedger.reduce((s, e) => s + e.totalQuantity, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {supplierLedger.reduce((s, e) => s + e.totalPurchased, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3" colSpan={2}>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Warehouse Entries (Payment Tracking) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Warehouse Entries (Payment Tracking)</CardTitle>
        </CardHeader>
        <CardContent>
          {warehouseEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No warehouse entries yet.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Warehouse #</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Weight (kg)</th>
                    <th className="px-4 py-3">Cost (ETB)</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseEntries.slice(0, 20).map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="px-4 py-3">
                        {new Date(entry.arrivalTimestamp).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{entry.warehouseNumber}</td>
                      <td className="px-4 py-3">{entry.batch.batchNumber}</td>
                      <td className="px-4 py-3">{entry.batch.supplier.name}</td>
                      <td className="px-4 py-3">{entry.arrivalWeightKg.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold">
                        {entry.batch.purchaseCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.batch.status === "STORED" ? "bg-green-100 text-green-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {entry.batch.status}
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
