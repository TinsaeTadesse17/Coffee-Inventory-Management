"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditQualityCheckDialog } from "./edit-quality-check-dialog"
import { format, formatDistanceToNow } from "date-fns"

interface QualityCheck {
  id: string
  sessionName: string
  sessionDate: Date
  checkpoint: string
  origin: string | null
  roastProfile: string | null
  fragranceScore: number | null
  flavorScore: number | null
  acidityScore: number | null
  bodyScore: number | null
  totalScore: number | null
  notes: string | null
  timestamp: Date
  batch: {
    batchNumber: string
    supplier: {
      name: string
    } | null
  }
  inspector: {
    name: string
  }
}

interface QualityChecksClientProps {
  initialChecks: QualityCheck[]
}

export function QualityChecksClient({ initialChecks }: QualityChecksClientProps) {
  const [checks, setChecks] = useState(initialChecks)
  const [editingCheck, setEditingCheck] = useState<QualityCheck | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEdit = (check: QualityCheck) => {
    setEditingCheck(check)
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
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Checkpoint</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Origin</th>
              <th className="px-4 py-3">Roast</th>
              <th className="px-4 py-3">Fragrance</th>
              <th className="px-4 py-3">Flavor</th>
              <th className="px-4 py-3">Acidity</th>
              <th className="px-4 py-3">Body</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Inspector</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.id} className="border-b">
                <td className="px-4 py-3 font-medium">
                  <div>{check.batch.batchNumber}</div>
                  <p className="text-xs text-muted-foreground">{check.batch.supplier?.name || 'Unknown'}</p>
                </td>
                <td className="px-4 py-3">{check.checkpoint}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{check.sessionName}</div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(check.sessionDate), "PP")}
                  </p>
                </td>
                <td className="px-4 py-3">{check.origin || "-"}</td>
                <td className="px-4 py-3">{check.roastProfile || "-"}</td>
                <td className="px-4 py-3">{check.fragranceScore?.toFixed(1) || "-"}</td>
                <td className="px-4 py-3">{check.flavorScore?.toFixed(1) || "-"}</td>
                <td className="px-4 py-3">{check.acidityScore?.toFixed(1) || "-"}</td>
                <td className="px-4 py-3">{check.bodyScore?.toFixed(1) || "-"}</td>
                <td className="px-4 py-3 font-semibold">{check.totalScore?.toFixed(2) || "-"}</td>
                <td className="px-4 py-3">{check.inspector.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(check.timestamp), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(check)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCheck && (
        <EditQualityCheckDialog
          check={editingCheck}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

