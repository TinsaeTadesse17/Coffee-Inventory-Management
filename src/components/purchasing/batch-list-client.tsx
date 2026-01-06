"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { EditBatchDialog } from "./edit-batch-dialog"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"

interface Batch {
  id: string
  batchNumber: string
  supplier: { name: string } | null
  thirdPartyEntity: { name: string } | null
  isThirdParty: boolean
  origin: string
  grade: string | null
  variety: string | null
  processingType: string
  purchasedQuantityKg: number
  currentQuantityKg: number
  purchaseCost: number
  purchaseCurrency: string
  exchangeRateAtPurchase: number | null
  containerCount: number | null
  status: string
  currentLocation: string | null
  createdAt: Date
}

interface BatchListClientProps {
  batches: Batch[]
}

export function BatchListClient({ batches }: BatchListClientProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch)
    setEditDialogOpen(true)
  }

  if (batches.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No purchase orders yet. Create one to get started.
      </div>
    )
  }

  return (
    <>
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
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className="border-b">
                <td className="px-4 py-3 font-medium">{batch.batchNumber}</td>
                <td className="px-4 py-3">
                  {batch.isThirdParty 
                    ? <span className="text-blue-600 font-medium">{batch.thirdPartyEntity?.name} (3rd Party)</span>
                    : batch.supplier?.name || 'Unknown'}
                </td>
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
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(batch)}
                      title="Edit batch"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBatch && (
        <EditBatchDialog
          batch={selectedBatch}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  )
}

