"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface WeighingRecord {
  id: string
  vehiclePlate: string
  grossWeightIn: number
  tareWeight: number | null
  netWeight: number | null
  notes: string | null
}

interface EditWeighingRecordDialogProps {
  record: WeighingRecord
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditWeighingRecordDialog({ record, open, onOpenChange, onSuccess }: EditWeighingRecordDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    vehiclePlate: record.vehiclePlate,
    grossWeightIn: record.grossWeightIn.toString(),
    tareWeight: record.tareWeight?.toString() || "",
    netWeight: record.netWeight?.toString() || "",
    notes: record.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/weighing-records/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update weighing record")
      }

      toast({
        title: "Success",
        description: "Weighing record updated successfully",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update weighing record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Weighing Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
            <Input
              id="vehiclePlate"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="grossWeightIn">Gross Weight (kg)</Label>
              <Input
                id="grossWeightIn"
                type="number"
                step="0.01"
                value={formData.grossWeightIn}
                onChange={(e) => setFormData({ ...formData, grossWeightIn: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tareWeight">Tare Weight (kg)</Label>
              <Input
                id="tareWeight"
                type="number"
                step="0.01"
                value={formData.tareWeight}
                onChange={(e) => setFormData({ ...formData, tareWeight: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="netWeight">Net Weight (kg)</Label>
              <Input
                id="netWeight"
                type="number"
                step="0.01"
                value={formData.netWeight}
                onChange={(e) => setFormData({ ...formData, netWeight: e.target.value })}
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
              placeholder="Driver name, special instructions, etc."
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


