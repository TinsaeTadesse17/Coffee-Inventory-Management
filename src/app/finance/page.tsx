import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { DownloadFinancialReportButton } from "@/components/finance/download-financial-report-button"
import { DownloadSupplierLedgerButton } from "@/components/finance/download-supplier-ledger-button"
import { NewAdditionalCostButton } from "@/components/finance/new-additional-cost-button"
import { formatCurrency } from "@/lib/format-utils"
import { getSettings } from "@/lib/settings"

export default async function FinancePage() {
  const user = await requireRoles(["FINANCE", "CEO", "ADMIN"])

  // Fetch real financial data
  const [batches, contracts, processingRuns, suppliers, warehouseEntries, additionalCosts, settings, processingCosts, storageCosts] = await Promise.all([
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
    prisma.additionalCost.findMany({
      include: {
        recordedByUser: true,
        batch: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    getSettings(),
    prisma.processingCost.findMany({
      orderBy: { createdAt: "desc" }
    }),
    prisma.storageCost.findMany({
      orderBy: { createdAt: "desc" }
    })
  ])

  const exchangeRate = settings.exchangeRate

  // Calculate Payables (money we owe to suppliers)
  const totalPayables = batches.reduce((sum, batch) => sum + batch.purchaseCost, 0)
  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)
  
  // Calculate Service Revenue (Third Party)
  const totalProcessingRevenue = processingCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalStorageRevenue = storageCosts.reduce((sum, c) => sum + c.totalCost, 0)
  const totalServiceRevenue = totalProcessingRevenue + totalStorageRevenue

  // For simplicity, assume all batches are unpaid (can add payment tracking later)
  const unpaidPayables = totalPayables

  // Calculate Receivables (money customers owe us)
  const approvedContracts = contracts.filter(c => c.approvalStatus === "APPROVED")
  const totalReceivables = approvedContracts.reduce(
    (sum, contract) => sum + (contract.quantityKg * (contract.pricePerKg || 0)), 
    0
  ) + totalServiceRevenue // Add service revenue to receivables
  
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
          <p className="text-muted-foreground">Financial overview and reports</p>
        </div>
        <div className="flex gap-2">
          <NewAdditionalCostButton />
          <DownloadSupplierLedgerButton />
          <DownloadFinancialReportButton />
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
            <p className="text-sm text-muted-foreground">
              ${(unpaidPayables / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-sm text-muted-foreground">
              ETB {(totalReceivables * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
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
            <p className="text-sm text-muted-foreground">
              ETB {(pendingValue * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingContracts.length} contracts awaiting CEO
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ETB {totalServiceRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">
              ${(totalServiceRevenue / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Processing & Storage Fees
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
            <p className="text-sm text-muted-foreground">
              ${(inventoryValue / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Current stock value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Additional Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ETB {totalAdditionalCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-muted-foreground">
              ${(totalAdditionalCosts / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Transport, duties, etc.
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
            <p className="text-sm text-muted-foreground">
              ${(totalCost / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{batches.length} batches purchased</p>
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
            <p className="text-sm text-muted-foreground">
              ETB {(exportValue * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
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

      {/* Recent Additional Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Additional Costs</CardTitle>
        </CardHeader>
        <CardContent>
          {additionalCosts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No additional costs recorded yet.
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount (ETB)</th>
                    <th className="px-4 py-3">Related Batch</th>
                    <th className="px-4 py-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalCosts.map((cost) => (
                    <tr key={cost.id} className="border-b">
                      <td className="px-4 py-3">
                        {new Date(cost.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{cost.costType}</td>
                      <td className="px-4 py-3">{cost.description}</td>
                      <td className="px-4 py-3 font-semibold text-red-600">
                        {formatCurrency(cost.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {cost.batch ? cost.batch.batchNumber : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {cost.recordedByUser.name}
                      </td>
                    </tr>
                  ))}
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
                      <td className="px-4 py-3">{entry.batch.supplier?.name || 'Unknown'}</td>
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
