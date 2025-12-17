"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { BatchSelector } from "@/components/ui/batch-selector"

const scoreDefinitions = [
  { name: "fragrance", label: "Fragrance" },
  { name: "flavor", label: "Flavor" },
  { name: "aftertaste", label: "Aftertaste" },
  { name: "acidity", label: "Acidity" },
  { name: "body", label: "Body" },
  { name: "balance", label: "Balance" },
  { name: "sweetness", label: "Sweetness" },
  { name: "uniformity", label: "Uniformity" },
  { name: "cleanCup", label: "Clean Cup" },
  { name: "overall", label: "Overall" },
]

export function NewQCCheckButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState("")
  const [scores, setScores] = useState<Record<string, number>>(
    scoreDefinitions.reduce((acc, def) => ({ ...acc, [def.name]: 0 }), {} as Record<string, number>)
  )

  const totalScore = useMemo(
    () => Object.values(scores).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0),
    [scores]
  )

  const handleScoreChange = (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    let numericValue = parseFloat(value)

    if (numericValue > 10) {
      e.target.value = "10"
      numericValue = 10
    } else if (numericValue < 0) {
      e.target.value = "0"
      numericValue = 0
    }

    setScores((prev) => ({
      ...prev,
      [name]: Number.isNaN(numericValue) ? 0 : numericValue,
    }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      if (!batchId) {
        toast.error("Please select a batch")
        setLoading(false)
        return
      }

      const formData = new FormData(e.currentTarget)
      const payload = {
        batchId: batchId,
        sessionName: formData.get("sessionName"),
        sessionDate: formData.get("sessionDate"),
        origin: formData.get("origin"),
        roastProfile: formData.get("roastProfile"),
        fragrance: Number(formData.get("fragrance")),
        flavor: Number(formData.get("flavor")),
        aftertaste: Number(formData.get("aftertaste")),
        acidity: Number(formData.get("acidity")),
        body: Number(formData.get("body")),
        balance: Number(formData.get("balance")),
        sweetness: Number(formData.get("sweetness")),
        uniformity: Number(formData.get("uniformity")),
        cleanCup: Number(formData.get("cleanCup")),
        overall: Number(formData.get("overall")),
        notes: formData.get("notes"),
      }

      const response = await fetch("/api/quality/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to record QC check")
      }

      const result = await response.json()
      toast.success(`QC check recorded! Total Score: ${result.totalScore.toFixed(2)} (${result.passed ? "Pass" : "Hold"})`)
      
      // Close dialog and refresh page
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("QC check error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to record QC check")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New QC Check
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[calc(90vh-8rem)]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>New Quality Check</DialogTitle>
            <DialogDescription>
              Record quality inspection results for a batch.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            <div className="grid gap-2">
              <Label htmlFor="batchId">Batch ID *</Label>
              <BatchSelector
                value={batchId}
                onChange={setBatchId}
                filter={(batch) => 
                  batch.status === "STORED" || 
                  batch.status === "AT_WAREHOUSE" ||
                  batch.status === "PROCESSED" ||
                  batch.status === "EXPORT_READY" ||
                  batch.status === "REJECTED"
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Quality checks can be done on batches in warehouse or after processing
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sessionName">Session Name *</Label>
              <Input
                id="sessionName"
                name="sessionName"
                placeholder="e.g., Weekly Evaluation"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sessionDate">Date *</Label>
              <Input
                id="sessionDate"
                name="sessionDate"
                type="date"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  name="origin"
                  placeholder="e.g., Kaffa, Ethiopia"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roastProfile">Roast Profile</Label>
                <Input
                  id="roastProfile"
                  name="roastProfile"
                  placeholder="e.g., Light Roast"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {scoreDefinitions.map((score) => (
                <div className="grid gap-2" key={score.name}>
                  <Label htmlFor={score.name}>{score.label} *</Label>
                  <Input
                    id={score.name}
                    name={score.name}
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    onChange={(e) => handleScoreChange(score.name, e)}
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Flavor highlights, recommendations, etc."
              />
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total Score</span>
              <span className="font-semibold">{totalScore.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record QC Check"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

