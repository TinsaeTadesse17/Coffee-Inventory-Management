
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { BatchSelector } from "@/components/ui/batch-selector"

export function NewAdditionalCostButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      costType: formData.get("costType"),
      description: formData.get("description"),
      amount: formData.get("amount"),
      batchId: batchId || undefined,
    }

    try {
      const response = await fetch("/api/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to record cost")
      }

      toast.success("Cost recorded successfully")
      setOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to record cost")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Cost
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Additional Cost</DialogTitle>
          <DialogDescription>
            Log expenses like transportation, documentation, or loading/unloading.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="costType">Cost Type</Label>
            <select
              id="costType"
              name="costType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="Transportation">Transportation</option>
              <option value="Documentation">Documentation</option>
              <option value="Loading/Unloading">Loading/Unloading</option>
              <option value="Tax/Duty">Tax/Duty</option>
              <option value="Supplies">Supplies</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Details about the cost (e.g., Truck plate 12345 from Jimma)"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (ETB)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Related Batch (Optional)</Label>
            <BatchSelector
              value={batchId}
              onChange={setBatchId}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Select if this cost is specific to a coffee batch.
            </p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Cost
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
