"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditWeighingRecordDialog } from "./edit-weighing-record-dialog"
import { formatDistanceToNow } from "date-fns"

interface WeighingRecord {
  id: string
  vehiclePlate: string
  grossWeightIn: number
  tareWeight: number | null
  netWeight: number | null
  notes: string | null
  timestampIn: Date
  batch: {
    batchNumber: string
    supplier: {
      name: string
    } | null
  }
}

interface WeighingRecordsClientProps {
  initialRecords: WeighingRecord[]
}

export function WeighingRecordsClient({ initialRecords }: WeighingRecordsClientProps) {
  const [records, setRecords] = useState(initialRecords)
  const [editingRecord, setEditingRecord] = useState<WeighingRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEdit = (record: WeighingRecord) => {
    setEditingRecord(record)
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
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Gross (kg)</th>
              <th className="px-4 py-3">Tare (kg)</th>
              <th className="px-4 py-3">Net (kg)</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b">
                <td className="px-4 py-3 font-medium">{record.vehiclePlate}</td>
                <td className="px-4 py-3">{record.notes?.replace('Driver: ', '') || '-'}</td>
                <td className="px-4 py-3">{record.batch.batchNumber}</td>
                <td className="px-4 py-3">{record.grossWeightIn.toFixed(2)}</td>
                <td className="px-4 py-3">{record.tareWeight?.toFixed(2) || '-'}</td>
                <td className="px-4 py-3 font-semibold text-green-600">
                  {record.netWeight?.toFixed(2) || '-'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(record.timestampIn), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(record)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRecord && (
        <EditWeighingRecordDialog
          record={editingRecord}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

