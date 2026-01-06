"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditWarehouseEntryDialog } from "./edit-warehouse-entry-dialog"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"

interface WarehouseEntry {
  id: string
  warehouseNumber: string
  entryType: string
  storageLocations: string[] | null
  arrivalWeightKg: number
  bags: number | null
  moisturePercent: number | null
  temperatureCelsius: number | null
  notes: string | null
  arrivalTimestamp: Date
  batch: {
    batchNumber: string
    supplier: {
      name: string
    } | null
  }
}

interface WarehouseEntriesClientProps {
  initialEntries: WarehouseEntry[]
}

export function WarehouseEntriesClient({ initialEntries }: WarehouseEntriesClientProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"
  const [entries, setEntries] = useState(initialEntries)
  const [editingEntry, setEditingEntry] = useState<WarehouseEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleEdit = (entry: WarehouseEntry) => {
    setEditingEntry(entry)
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
              <th className="px-4 py-3">Warehouse #</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Locations</th>
              <th className="px-4 py-3">Weight (kg)</th>
              <th className="px-4 py-3">Bags</th>
              <th className="px-4 py-3">Moisture %</th>
              <th className="px-4 py-3">Temp °C</th>
              <th className="px-4 py-3">Recorded</th>
              {isAdmin && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b">
                <td className="px-4 py-3 font-medium">{entry.warehouseNumber}</td>
                <td className="px-4 py-3">{entry.batch.batchNumber}</td>
                <td className="px-4 py-3">{entry.batch.supplier?.name || 'Unknown'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-muted text-xs font-semibold uppercase tracking-wide">
                    {entry.entryType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {entry.storageLocations && entry.storageLocations.length > 0
                    ? entry.storageLocations.join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-3 font-semibold">{entry.arrivalWeightKg.toFixed(2)}</td>
                <td className="px-4 py-3">{entry.bags ?? "-"}</td>
                <td className="px-4 py-3">{entry.moisturePercent?.toFixed(1) || '-'}</td>
                <td className="px-4 py-3">{entry.temperatureCelsius?.toFixed(1) || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.arrivalTimestamp), { addSuffix: true })}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(entry)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEntry && (
        <EditWarehouseEntryDialog
          entry={editingEntry}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}


