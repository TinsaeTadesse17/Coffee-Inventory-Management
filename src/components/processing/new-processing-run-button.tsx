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
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function NewProcessingRunButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        batchId: formData.get("batchId"),
        inputWeight: parseFloat(formData.get("inputWeight") as string),
        processType: formData.get("processType"),
      }

      const response = await fetch("/api/processing/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create processing run")
      }

      const result = await response.json()
      toast.success(`Processing run created! Output: ${result.outputWeight.toFixed(2)} kg (${result.yieldPercentage}% yield)`)
      
      // Close dialog and refresh page
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Processing run error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create processing run")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Processing Run
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New Processing Run</DialogTitle>
            <DialogDescription>
              Start a new coffee processing operation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="batchId">Batch ID *</Label>
              <Input
                id="batchId"
                name="batchId"
                placeholder="e.g., BTH-2024-001"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inputWeight">Input Weight (kg) *</Label>
              <Input
                id="inputWeight"
                name="inputWeight"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="processType">Process Type *</Label>
              <select
                id="processType"
                name="processType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select process type</option>
                <option value="EXPORT">Export Grade (produces jotbag as byproduct)</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Start Processing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

