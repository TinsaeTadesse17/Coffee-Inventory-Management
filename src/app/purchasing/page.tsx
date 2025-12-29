import { requireRoles } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewPurchaseOrderButton } from "@/components/purchasing/new-purchase-order-button"
import { NewThirdPartyBatchButton } from "@/components/purchasing/new-third-party-batch-button"
import { NewAdditionalCostButton } from "@/components/finance/new-additional-cost-button"
import { BatchListClient } from "@/components/purchasing/batch-list-client"
import { prisma } from "@/lib/prisma"

export default async function PurchasingPage() {
  const user = await requireRoles(["PURCHASING", "CEO", "ADMIN"])

  // Fetch recent batches (purchase orders)
  const recentBatches = await prisma.batch.findMany({
    include: {
      supplier: true,
      thirdPartyEntity: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchasing & Sourcing</h1>
          <p className="text-muted-foreground">Manage purchase orders and third-party processing requests</p>
        </div>
        <div className="flex gap-2">
          <NewAdditionalCostButton />
          <NewThirdPartyBatchButton />
          <NewPurchaseOrderButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchListClient batches={recentBatches} />
        </CardContent>
      </Card>
    </div>
  )
}
