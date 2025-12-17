import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, Droplets, DollarSign, CheckCircle, XCircle, Clock, FileText, ShoppingCart, Scale, Warehouse, FlaskConical, Factory, Ship } from "lucide-react"
import { Role } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { ContractApprovalButtons } from "./contract-approval-buttons"
import { EnhancedCEODashboard } from "./ceo-enhanced-dashboard"
import { formatNumber, formatCurrency, formatWeight } from "@/lib/format-utils"

interface DashboardData {
  batches: any[]
  warehouseEntries: any[]
  qualityChecks: any[]
  processingRuns: any[]
  contracts: any[]
  todayWarehouseEntries: any[]
  recentActivity: any[]
  weighingRecords?: any[]
  additionalCosts?: any[]
  processingCosts?: any[]
  storageCosts?: any[]
  exchangeRate?: number
}

export function RoleDashboard({ role, data }: { role: Role; data: DashboardData }) {
  switch (role) {
    case "CEO":
      return <EnhancedCEODashboard data={data} />
    case "PURCHASING":
      return <PurchasingDashboard data={data} />
    case "SECURITY":
      return <SecurityDashboard data={data} />
    case "QUALITY":
      return <QualityDashboard data={data} />
    case "WAREHOUSE":
      return <WarehouseDashboard data={data} />
    case "PLANT_MANAGER":
      return <PlantManagerDashboard data={data} />
    case "EXPORT_MANAGER":
      return <ExportManagerDashboard data={data} />
    case "FINANCE":
      return <FinanceDashboard data={data} />
    case "ADMIN":
      return <AdminDashboard data={data} />
    default:
      return <AdminDashboard data={data} />
  }
}

// Legacy CEO Dashboard - kept for compatibility
function CEODashboard({ data }: { data: DashboardData }) {
  return <EnhancedCEODashboard data={data} />
}

function PurchasingDashboard({ data }: { data: DashboardData }) {
  const { batches } = data
  const orderedBatches = batches.filter(b => b.status === "ORDERED")
  const inTransit = batches.filter(b => b.status === "AT_GATE")
  const totalOrdered = orderedBatches.reduce((sum, b) => sum + b.purchasedQuantityKg, 0)
  const totalValue = orderedBatches.reduce((sum, b) => sum + b.purchaseCost, 0)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(orderedBatches.length, 0)}</div>
            <p className="text-xs text-muted-foreground">{formatWeight(totalOrdered)} ordered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(inTransit.length, 0)}</div>
            <p className="text-xs text-muted-foreground">Batches at gate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue, 'ETB')}</div>
            <p className="text-xs text-muted-foreground">Total pending orders</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orderedBatches.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending orders</div>
          ) : (
            <div className="space-y-2">
              {orderedBatches.slice(0, 5).map(b => (
                <div key={b.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{b.batchNumber}</p>
                    <p className="text-xs text-muted-foreground">{b.supplier.name} • {b.origin}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatWeight(b.purchasedQuantityKg)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(b.purchaseCost, 'ETB')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function SecurityDashboard({ data }: { data: DashboardData }) {
  const { weighingRecords = [], batches } = data
  const todayWeighings = (weighingRecords || []).filter((w: any) => {
    const today = new Date().toDateString()
    return new Date(w.timestampIn).toDateString() === today
  })
  const atGate = batches.filter(b => b.status === "AT_GATE").length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Weighings</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(todayWeighings.length, 0)}</div>
            <p className="text-xs text-muted-foreground">Vehicles weighed today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting at Gate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(atGate, 0)}</div>
            <p className="text-xs text-muted-foreground">Batches pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weighings</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber((weighingRecords || []).length, 0)}</div>
            <p className="text-xs text-muted-foreground">All time records</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Weighing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!weighingRecords || weighingRecords.length === 0 ? (
            <div className="text-sm text-muted-foreground">No weighing records yet</div>
          ) : (
            <div className="space-y-2">
              {(weighingRecords || []).slice(0, 5).map((w: any) => (
                <div key={w.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{w.batch?.batchNumber || `Batch ${w.batchId?.substring(0, 8)}` || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.batch?.supplier?.name ? `${w.batch.supplier.name} - ` : ''}{w.vehiclePlate || 'No plate'}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(w.timestampIn).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatWeight(w.netWeight)}</p>
                    <p className="text-xs text-muted-foreground">Net weight</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function QualityDashboard({ data }: { data: DashboardData }) {
  const { qualityChecks, batches } = data
  const today = new Date().toDateString()
  const todayChecks = qualityChecks.filter(qc => new Date(qc.timestamp).toDateString() === today)
  const avgTotalScore = qualityChecks.length > 0
    ? qualityChecks.reduce((sum, qc) => sum + (qc.totalScore || 0), 0) / qualityChecks.length
    : 0
  
  const passedCount = qualityChecks.filter(qc => (qc.totalScore || 0) >= 80).length
  const rejectedCount = qualityChecks.filter(qc => (qc.totalScore || 0) < 80).length
  
  const waitingQC = batches.filter(b => b.status === "AT_WAREHOUSE").length
  const latestChecks = qualityChecks
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cup Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(avgTotalScore, 2)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(qualityChecks.length, 0)} total checks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QC Status</CardTitle>
            <div className="flex gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(passedCount, 0)} / {formatNumber(rejectedCount, 0)}</div>
            <p className="text-xs text-muted-foreground">Passed / Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting for QC</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(waitingQC, 0)}</div>
            <p className="text-xs text-muted-foreground">Batches in warehouse</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Quality Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {qualityChecks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No quality checks yet</div>
          ) : (
            <div className="space-y-2">
              {latestChecks.map(qc => (
                <div key={qc.id} className="flex justify-between items-center gap-4 p-3 border rounded">
                  <div className="space-y-1">
                    <p className="font-medium">Batch {qc.batchId?.substring(0, 8) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {qc.sessionName} • {new Date(qc.sessionDate).toLocaleDateString()}
                    </p>
                    {qc.origin && (
                      <p className="text-xs text-muted-foreground">Origin: {qc.origin}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{qc.totalScore ? formatNumber(qc.totalScore, 2) : "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(qc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function WarehouseDashboard({ data }: { data: DashboardData }) {
  const { warehouseEntries, todayWarehouseEntries, batches } = data
  const totalStock = warehouseEntries.reduce((sum, e) => sum + e.arrivalWeightKg, 0)
  const todaysArrivals = todayWarehouseEntries.reduce((sum, e) => sum + e.arrivalWeightKg, 0)
  const uniqueLocations = new Set(
    warehouseEntries.flatMap(e => (e.storageLocations ?? [])).filter(Boolean)
  ).size
  const inWarehouse = batches.filter(b => ["AT_WAREHOUSE", "STORED"].includes(b.status)).length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(totalStock)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(warehouseEntries.length, 0)} entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Arrivals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(todaysArrivals)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(todayWarehouseEntries.length, 0)} batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Locations</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(uniqueLocations, 0)}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Warehouse Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {warehouseEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground">No warehouse entries yet</div>
          ) : (
            <div className="space-y-2">
              {warehouseEntries.slice(0, 5).map(e => (
                <div key={e.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{e.warehouseNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {(e.storageLocations && e.storageLocations.length > 0
                        ? e.storageLocations.join(", ")
                        : "No location")} • {new Date(e.arrivalTimestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatWeight(e.arrivalWeightKg)}</p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function PlantManagerDashboard({ data }: { data: DashboardData }) {
  const { processingRuns, batches, qualityChecks } = data
  const todayRuns = processingRuns.filter(pr => {
    const today = new Date().toDateString()
    return new Date(pr.startTime).toDateString() === today
  })
  
  // Filter batches that are STORED and have passed QC (score >= 80)
  const readyForProcessing = batches.filter(b => {
    if (b.status !== "STORED") return false;
    const hasPassedQC = qualityChecks.some((qc: any) => qc.batchId === b.id && (qc.totalScore || 0) >= 80);
    return hasPassedQC;
  }).length

  const totalProcessed = processingRuns.reduce((sum, pr) => sum + (pr.exportQuantity || 0), 0)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Processing</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(readyForProcessing, 0)}</div>
            <p className="text-xs text-muted-foreground">QC passed batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Runs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(todayRuns.length, 0)}</div>
            <p className="text-xs text-muted-foreground">Processing runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(totalProcessed)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(processingRuns.length, 0)} total runs</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Processing Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {processingRuns.length === 0 ? (
            <div className="text-sm text-muted-foreground">No processing runs yet</div>
          ) : (
            <div className="space-y-2">
              {processingRuns.slice(0, 5).map(pr => (
                <div key={pr.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{pr.runNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {pr.inputBatches.map((b: any) => b.batchNumber).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(pr.startTime).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatWeight(pr.exportQuantity)}</p>
                    <p className="text-xs text-muted-foreground">Yield: {pr.yieldRatio ? formatNumber(pr.yieldRatio * 100, 1) : 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ExportManagerDashboard({ data }: { data: DashboardData }) {
  const { contracts, batches } = data
  const pendingContracts = contracts.filter(c => c.approvalStatus === "PENDING").length
  const approvedContracts = contracts.filter(c => c.approvalStatus === "APPROVED").length
  const contractValue = contracts.filter(c => c.approvalStatus === "APPROVED").reduce((sum, c) => sum + (c.quantityKg * (c.pricePerKg || 0)), 0)
  const exportReady = batches.filter(b => b.status === "EXPORT_READY").length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatNumber(pendingContracts, 0)}</div>
            <p className="text-xs text-muted-foreground">Awaiting CEO approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(contractValue, 'USD')}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(approvedContracts, 0)} approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Ready</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(exportReady, 0)}</div>
            <p className="text-xs text-muted-foreground">Batches ready</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No contracts yet</div>
          ) : (
            <div className="space-y-2">
              {contracts.slice(0, 5).map(c => (
                <div key={c.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{c.contractNumber}</p>
                    <p className="text-xs text-muted-foreground">{c.buyer} • {formatWeight(c.quantityKg)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${c.approvalStatus === "APPROVED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {c.approvalStatus}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(c.quantityKg * (c.pricePerKg || 0), 'USD')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function FinanceDashboard({ data }: { data: DashboardData }) {
  const { batches, contracts, warehouseEntries, additionalCosts, exchangeRate = 120 } = data
  const totalPayables = batches.reduce((sum, b) => sum + b.purchaseCost, 0)
  const totalReceivables = contracts.filter(c => c.approvalStatus === "APPROVED").reduce((sum, c) => sum + (c.quantityKg * (c.pricePerKg || 0)), 0)
  const inventoryValue = batches.filter(b => ["AT_WAREHOUSE", "STORED", "PROCESSED", "EXPORT_READY"].includes(b.status)).reduce((sum, b) => sum + b.purchaseCost, 0)
  const totalAdditionalCosts = additionalCosts?.reduce((sum, c) => sum + c.amount, 0) || 0

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPayables, 'ETB')}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalPayables / exchangeRate, 'USD')}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(batches.length, 0)} batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceivables, 'USD')}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalReceivables * exchangeRate, 'ETB')}</p>
            <p className="text-xs text-muted-foreground mt-1">Approved contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryValue, 'ETB')}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(inventoryValue / exchangeRate, 'USD')}</p>
            <p className="text-xs text-muted-foreground mt-1">Current stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Additional Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalAdditionalCosts, 'ETB')}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalAdditionalCosts / exchangeRate, 'USD')}</p>
            <p className="text-xs text-muted-foreground mt-1">{additionalCosts?.length || 0} records</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function AdminDashboard({ data }: { data: DashboardData }) {
  const { batches, warehouseEntries, qualityChecks, processingRuns, contracts, recentActivity } = data
  const totalStock = warehouseEntries.reduce((sum, e) => sum + e.arrivalWeightKg, 0)
  const averageCupScore = qualityChecks.length > 0
    ? qualityChecks.reduce((sum, qc) => sum + (qc.totalScore || 0), 0) / qualityChecks.length
    : 0
  const pendingContracts = contracts.filter(c => c.approvalStatus === "PENDING").length

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWeight(totalStock)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(warehouseEntries.length, 0)} entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cup Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(averageCupScore, 2)}</div>
            <p className="text-xs text-muted-foreground">{formatNumber(qualityChecks.length, 0)} checks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(pendingContracts, 0)}</div>
            <p className="text-xs text-muted-foreground">Contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(batches.length, 0)}</div>
            <p className="text-xs text-muted-foreground">All batches</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent activity</div>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">
                      {log.action
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">{log.entity} • by {log.user.name}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

