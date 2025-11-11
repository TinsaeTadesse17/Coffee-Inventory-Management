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

export function NewWeighingRecordButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        vehiclePlate: formData.get("vehiclePlate"),
        driverName: formData.get("driverName"),
        grossWeight: parseFloat(formData.get("grossWeight") as string),
        tareWeight: parseFloat(formData.get("tareWeight") as string),
      }

      const response = await fetch("/api/weighing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("API Error Response:", error)
        throw new Error(error.error || "Failed to create weighing record")
      }

      const result = await response.json()
      toast.success(`Weighing record created! Net weight: ${result.netWeight.toFixed(2)} kg`)
      
      // Close dialog and refresh page
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Weighing record creation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create weighing record")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Weighing Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Record Vehicle Weighing</DialogTitle>
            <DialogDescription>
              Record weighing details for incoming coffee delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vehiclePlate">Vehicle Plate Number *</Label>
              <Input
                id="vehiclePlate"
                name="vehiclePlate"
                placeholder="e.g., ET-3-12345"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="driverName">Driver Name *</Label>
              <Input
                id="driverName"
                name="driverName"
                placeholder="Enter driver name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grossWeight">Gross Weight (kg) *</Label>
                <Input
                  id="grossWeight"
                  name="grossWeight"
                  type="number"
                  step="0.01"
                  placeholder="Vehicle + Coffee"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tareWeight">Tare Weight (kg) *</Label>
                <Input
                  id="tareWeight"
                  name="tareWeight"
                  type="number"
                  step="0.01"
                  placeholder="Empty vehicle"
                  required
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Net weight will be calculated automatically: Gross - Tare
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
              {loading ? "Recording..." : "Record Weighing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

