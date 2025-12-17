import { requireRoles } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, Clock, AlertCircle } from "lucide-react"

export default async function ProcessingQueuePage() {
  await requireRoles(["PLANT_MANAGER", "CEO", "ADMIN"])

  const batches = await prisma.batch.findMany({
    where: { 
      status: "STORED",
      currentQuantityKg: { gt: 0 } // Only show batches with quantity
    },
    include: { 
      supplier: true, 
      thirdPartyEntity: true 
    },
    orderBy: { warehouseEntryDate: "asc" }
  })

  const internalBatches = batches.filter(b => !b.isThirdParty)
  const thirdPartyBatches = batches.filter(b => b.isThirdParty)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processing Queue</h1>
          <p className="text-muted-foreground">Manage processing priority and schedule</p>
        </div>
        <Button asChild>
          <Link href="/processing">Back to Processing Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Internal Batches - High Priority */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Internal Batches (Priority)</span>
              <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {internalBatches.length} Pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {internalBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No internal batches waiting.</p>
            ) : (
              <div className="space-y-4">
                {internalBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div>
                      <div className="font-medium">{batch.batchNumber}</div>
                      <div className="text-sm text-muted-foreground">{batch.supplier?.name} • {batch.origin}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Arrived {batch.warehouseEntryDate ? formatDistanceToNow(batch.warehouseEntryDate, { addSuffix: true }) : 'Unknown'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{batch.currentQuantityKg.toFixed(2)} kg</div>
                      <Button size="sm" variant="outline" className="mt-2" asChild>
                        <Link href={`/processing/run?batchId=${batch.id}`}>
                          Process <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Third Party Batches - Standard Priority */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Third Party Queue</span>
              <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {thirdPartyBatches.length} Pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {thirdPartyBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No third party batches waiting.</p>
            ) : (
              <div className="space-y-4">
                {thirdPartyBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div>
                      <div className="font-medium">{batch.batchNumber}</div>
                      <div className="text-sm text-blue-600 font-medium">{batch.thirdPartyEntity?.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Arrived {batch.warehouseEntryDate ? formatDistanceToNow(batch.warehouseEntryDate, { addSuffix: true }) : 'Unknown'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{batch.currentQuantityKg.toFixed(2)} kg</div>
                      <Button size="sm" variant="outline" className="mt-2" asChild>
                        <Link href={`/processing/run?batchId=${batch.id}`}>
                          Process <ArrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
