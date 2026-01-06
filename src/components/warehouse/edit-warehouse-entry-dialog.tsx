"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

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
}

interface EditWarehouseEntryDialogProps {
  entry: WarehouseEntry
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditWarehouseEntryDialog({ entry, open, onOpenChange, onSuccess }: EditWarehouseEntryDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    warehouseNumber: entry.warehouseNumber,
    entryType: entry.entryType,
    storageLocations: (entry.storageLocations || []).join(", "),
    arrivalWeightKg: entry.arrivalWeightKg.toString(),
    bags: entry.bags?.toString() || "",
    moisturePercent: entry.moisturePercent?.toString() || "",
    temperatureCelsius: entry.temperatureCelsius?.toString() || "",
    notes: entry.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const storageLocations = formData.storageLocations
        .split(",")
        .map(loc => loc.trim())
        .filter(Boolean)

      const response = await fetch(`/api/warehouse-entries/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          storageLocations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update warehouse entry")
      }

      toast({
        title: "Success",
        description: "Warehouse entry updated successfully",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update warehouse entry",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Warehouse Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warehouseNumber">Warehouse Number</Label>
              <Input
                id="warehouseNumber"
                value={formData.warehouseNumber}
                onChange={(e) => setFormData({ ...formData, warehouseNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="entryType">Entry Type</Label>
              <Select
                value={formData.entryType}
                onValueChange={(value) => setFormData({ ...formData, entryType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PARCHMENT">Parchment</SelectItem>
                  <SelectItem value="CHERRY">Cherry</SelectItem>
                  <SelectItem value="GREEN">Green</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="storageLocations">Storage Locations (comma-separated)</Label>
            <Input
              id="storageLocations"
              value={formData.storageLocations}
              onChange={(e) => setFormData({ ...formData, storageLocations: e.target.value })}
              placeholder="A1, B2, C3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arrivalWeightKg">Arrival Weight (kg)</Label>
              <Input
                id="arrivalWeightKg"
                type="number"
                step="0.01"
                value={formData.arrivalWeightKg}
                onChange={(e) => setFormData({ ...formData, arrivalWeightKg: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="bags">Number of Bags</Label>
              <Input
                id="bags"
                type="number"
                value={formData.bags}
                onChange={(e) => setFormData({ ...formData, bags: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="moisturePercent">Moisture %</Label>
              <Input
                id="moisturePercent"
                type="number"
                step="0.1"
                value={formData.moisturePercent}
                onChange={(e) => setFormData({ ...formData, moisturePercent: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="temperatureCelsius">Temperature °C</Label>
              <Input
                id="temperatureCelsius"
                type="number"
                step="0.1"
                value={formData.temperatureCelsius}
                onChange={(e) => setFormData({ ...formData, temperatureCelsius: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


