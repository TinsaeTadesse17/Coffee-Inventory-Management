"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

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
}

interface EditQualityCheckDialogProps {
  check: QualityCheck
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditQualityCheckDialog({ check, open, onOpenChange, onSuccess }: EditQualityCheckDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    sessionName: check.sessionName,
    sessionDate: format(new Date(check.sessionDate), "yyyy-MM-dd"),
    checkpoint: check.checkpoint,
    origin: check.origin || "",
    roastProfile: check.roastProfile || "",
    fragranceScore: check.fragranceScore?.toString() || "",
    flavorScore: check.flavorScore?.toString() || "",
    acidityScore: check.acidityScore?.toString() || "",
    bodyScore: check.bodyScore?.toString() || "",
    totalScore: check.totalScore?.toString() || "",
    notes: check.notes || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/quality-checks/${check.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update quality check")
      }

      toast({
        title: "Success",
        description: "Quality check updated successfully",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quality check",
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
          <DialogTitle>Edit Quality Check</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionName">Session Name</Label>
              <Input
                id="sessionName"
                value={formData.sessionName}
                onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sessionDate">Session Date</Label>
              <Input
                id="sessionDate"
                type="date"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkpoint">Checkpoint</Label>
              <Input
                id="checkpoint"
                value={formData.checkpoint}
                onChange={(e) => setFormData({ ...formData, checkpoint: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="roastProfile">Roast Profile</Label>
            <Input
              id="roastProfile"
              value={formData.roastProfile}
              onChange={(e) => setFormData({ ...formData, roastProfile: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fragranceScore">Fragrance Score</Label>
              <Input
                id="fragranceScore"
                type="number"
                step="0.1"
                value={formData.fragranceScore}
                onChange={(e) => setFormData({ ...formData, fragranceScore: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="flavorScore">Flavor Score</Label>
              <Input
                id="flavorScore"
                type="number"
                step="0.1"
                value={formData.flavorScore}
                onChange={(e) => setFormData({ ...formData, flavorScore: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="acidityScore">Acidity Score</Label>
              <Input
                id="acidityScore"
                type="number"
                step="0.1"
                value={formData.acidityScore}
                onChange={(e) => setFormData({ ...formData, acidityScore: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bodyScore">Body Score</Label>
              <Input
                id="bodyScore"
                type="number"
                step="0.1"
                value={formData.bodyScore}
                onChange={(e) => setFormData({ ...formData, bodyScore: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="totalScore">Total Score</Label>
              <Input
                id="totalScore"
                type="number"
                step="0.01"
                value={formData.totalScore}
                onChange={(e) => setFormData({ ...formData, totalScore: e.target.value })}
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

