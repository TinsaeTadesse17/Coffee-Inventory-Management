"use client"

import { useState } from "react"
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
import { Check } from "lucide-react"
import { toast } from "sonner"
import { JuteBagSize } from "@/components/ui/weight-input"

interface CompleteProcessingRunButtonProps {
  runId: string
  runNumber: string
  totalInputWeight?: number
}

export function CompleteProcessingRunButton({ runId, runNumber, totalInputWeight = 0 }: CompleteProcessingRunButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [outputBagSize, setOutputBagSize] = useState<JuteBagSize>("KG_60")
  const [exportQty, setExportQty] = useState<string>("")
  const [rejectQty, setRejectQty] = useState<string>("")

  const waste = totalInputWeight - (parseFloat(exportQty || "0") + parseFloat(rejectQty || "0"))
  const isWasteNegative = waste < -0.01 // Allow small float error

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (isWasteNegative) {
      toast.error("Total output cannot exceed input weight")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        batchId: "COMPLETE_RUN", // Dummy ID to bypass legacy check if needed, or handle in API
        inputs: [], // No new inputs
        exportQuantity: parseFloat(formData.get("exportQuantity") as string),
        rejectQuantity: formData.get("rejectQuantity") ? parseFloat(formData.get("rejectQuantity") as string) : 0,
        outputBagSize,
        // We need to pass the runId to update, but the POST endpoint creates new.
        // We need a PUT endpoint or modify POST to handle updates.
        // For now, let's assume we'll add a PUT endpoint or use a specific flag.
        runId: runId 
      }

      // We need to implement the update logic. 
      // Since I haven't created a separate PUT endpoint yet, I'll use a new route for completion.
      const response = await fetch(`/api/processing/run/${runId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to complete processing run")
      }

      const result = await response.json()
      toast.success(`Processing run completed! Yield: ${(result.yieldRatio * 100).toFixed(1)}%`)
      
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Completion error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to complete run")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <Check className="h-3.5 w-3.5" />
          Complete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <DialogHeader>
            <DialogTitle>Complete Run {runNumber}</DialogTitle>
            <DialogDescription>
              Enter the final output details to finish this processing run.
              {totalInputWeight > 0 && (
                <div className="mt-2 p-2 bg-muted rounded-md text-sm font-medium text-foreground">
                  Total Input: {totalInputWeight.toFixed(2)} kg
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-2">
            <Label htmlFor="exportQuantity">Output Weight (kg) *</Label>
            <Input
              id="exportQuantity"
              name="exportQuantity"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
              value={exportQty}
              onChange={(e) => setExportQty(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rejectQuantity">Reject Weight (kg)</Label>
            <Input
              id="rejectQuantity"
              name="rejectQuantity"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={rejectQty}
              onChange={(e) => setRejectQty(e.target.value)}
            />
          </div>

          {totalInputWeight > 0 && (
            <div className={`text-sm font-medium ${isWasteNegative ? "text-red-500" : "text-muted-foreground"}`}>
              Calculated Waste/Loss: {waste.toFixed(2)} kg
              {isWasteNegative && " (Invalid: Output exceeds Input)"}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="outputBagSize">Output Bag Size</Label>
            <select
              id="outputBagSize"
              value={outputBagSize}
              onChange={(e) => setOutputBagSize(e.target.value as JuteBagSize)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="KG_60">60 kg (Export)</option>
              <option value="KG_50">50 kg (Export)</option>
              <option value="KG_30">30 kg (Export)</option>
              <option value="KG_85">85 kg (Reject)</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Completing..." : "Complete Run"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
