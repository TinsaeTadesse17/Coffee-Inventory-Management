"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ProcessingRun {
  id: string
  runNumber: string
  yieldRatio: number | null
  exportQuantity: number | null
  rejectQuantity: number | null
  jotbagQuantity: number | null
  notes: string | null
}

interface EditProcessingRunDialogProps {
  run: ProcessingRun
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditProcessingRunDialog({ run, open, onOpenChange, onSuccess }: EditProcessingRunDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    runNumber: run.runNumber,
    yieldRatio: run.yieldRatio?.toString() || "",
    exportQuantity: run.exportQuantity?.toString() || "",
    rejectQuantity: run.rejectQuantity?.toString() || "",
    jotbagQuantity: run.jotbagQuantity?.toString() || "",
    notes: run.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/processing-runs/${run.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update processing run")
      }

      toast({
        title: "Success",
        description: "Processing run updated successfully",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update processing run",
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
          <DialogTitle>Edit Processing Run</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="runNumber">Run Number</Label>
            <Input
              id="runNumber"
              value={formData.runNumber}
              onChange={(e) => setFormData({ ...formData, runNumber: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="yieldRatio">Yield Ratio (0-1)</Label>
            <Input
              id="yieldRatio"
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={formData.yieldRatio}
              onChange={(e) => setFormData({ ...formData, yieldRatio: e.target.value })}
              placeholder="e.g., 0.85 for 85%"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="exportQuantity">Export (kg)</Label>
              <Input
                id="exportQuantity"
                type="number"
                step="0.01"
                value={formData.exportQuantity}
                onChange={(e) => setFormData({ ...formData, exportQuantity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="rejectQuantity">Reject (kg)</Label>
              <Input
                id="rejectQuantity"
                type="number"
                step="0.01"
                value={formData.rejectQuantity}
                onChange={(e) => setFormData({ ...formData, rejectQuantity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="jotbagQuantity">Jotbag (kg)</Label>
              <Input
                id="jotbagQuantity"
                type="number"
                step="0.01"
                value={formData.jotbagQuantity}
                onChange={(e) => setFormData({ ...formData, jotbagQuantity: e.target.value })}
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


