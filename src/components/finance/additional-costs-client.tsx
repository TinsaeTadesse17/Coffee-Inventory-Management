"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditAdditionalCostDialog } from "./edit-additional-cost-dialog"
import { formatCurrency } from "@/lib/format-utils"

interface AdditionalCost {
  id: string
  costType: string
  description: string
  amount: number
  createdAt: Date
  batch: {
    batchNumber: string
  } | null
  recordedByUser: {
    name: string
  }
}

interface AdditionalCostsClientProps {
  initialCosts: AdditionalCost[]
}

export function AdditionalCostsClient({ initialCosts }: AdditionalCostsClientProps) {
  const [costs, setCosts] = useState(initialCosts)
  const [editingCost, setEditingCost] = useState<AdditionalCost | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEdit = (cost: AdditionalCost) => {
    setEditingCost(cost)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload()
  }

  return (
    <>
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
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => (
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
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(cost)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCost && (
        <EditAdditionalCostDialog
          cost={editingCost}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

