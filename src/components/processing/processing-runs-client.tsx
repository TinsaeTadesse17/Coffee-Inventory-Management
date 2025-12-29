"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditProcessingRunDialog } from "./edit-processing-run-dialog"
import { CompleteProcessingRunButton } from "./complete-processing-run-button"
import { formatDistanceToNow } from "date-fns"
import { formatNumber, formatWeight } from "@/lib/format-utils"

interface ProcessingRun {
  id: string
  runNumber: string
  yieldRatio: number | null
  exportQuantity: number | null
  rejectQuantity: number | null
  jotbagQuantity: number | null
  notes: string | null
  startTime: Date
  endTime: Date | null
  inputBatches: Array<{
    id: string
    batchNumber: string
    supplier: {
      name: string
    } | null
    thirdPartyEntity: {
      name: string
    } | null
  }>
  inputs: Array<{
    weightUsed: number
    batch: {
      id: string
      batchNumber: string
    }
  }>
  processedByUser: {
    name: string
  }
}

interface ProcessingRunsClientProps {
  initialRuns: ProcessingRun[]
}

export function ProcessingRunsClient({ initialRuns }: ProcessingRunsClientProps) {
  const [runs, setRuns] = useState(initialRuns)
  const [editingRun, setEditingRun] = useState<ProcessingRun | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEdit = (run: ProcessingRun) => {
    setEditingRun(run)
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
              <th className="px-4 py-3">Run Number</th>
              <th className="px-4 py-3">Input Batches</th>
              <th className="px-4 py-3">Yield %</th>
              <th className="px-4 py-3">Export (kg)</th>
              <th className="px-4 py-3">Reject (kg)</th>
              <th className="px-4 py-3">Jotbag (kg)</th>
              <th className="px-4 py-3">Processed By</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b">
                <td className="px-4 py-3 font-medium">{run.runNumber}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {run.inputBatches.map((batch) => (
                      <div key={batch.id} className="text-xs">
                        <span className="font-medium">{batch.batchNumber}</span>
                        <span className="text-muted-foreground ml-1">
                          {batch.supplier ? `(${batch.supplier.name})` : batch.thirdPartyEntity ? `(${batch.thirdPartyEntity.name})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {run.yieldRatio !== null ? `${formatNumber(run.yieldRatio * 100)}%` : '-'}
                </td>
                <td className="px-4 py-3 text-green-600 font-semibold">
                  {run.exportQuantity ? formatWeight(run.exportQuantity) : '-'}
                </td>
                <td className="px-4 py-3 text-red-600">
                  {run.rejectQuantity ? formatWeight(run.rejectQuantity) : '-'}
                </td>
                <td className="px-4 py-3 text-amber-600">
                  {run.jotbagQuantity ? formatWeight(run.jotbagQuantity) : '-'}
                </td>
                <td className="px-4 py-3">{run.processedByUser.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(run.startTime), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(run)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!run.endTime && (
                      <CompleteProcessingRunButton 
                        runId={run.id} 
                        runNumber={run.runNumber}
                        totalInputWeight={run.inputs.reduce((sum, i) => sum + i.weightUsed, 0)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRun && (
        <EditProcessingRunDialog
          run={editingRun}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

