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

export function NewPurchaseOrderButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        supplierName: formData.get("supplierName"),
        quantityKg: parseFloat(formData.get("quantityKg") as string),
        pricePerKg: parseFloat(formData.get("pricePerKg") as string),
        origin: formData.get("origin"),
      }

      const response = await fetch("/api/suppliers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("API Error Response:", error)
        throw new Error(error.error || "Failed to create purchase order")
      }

      const result = await response.json()
      toast.success(`Purchase order created! Batch ID: ${result.batch.id}`)
      
      // Close dialog and refresh page
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Purchase order creation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create purchase order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for coffee from a supplier.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="supplierName">Supplier Name *</Label>
              <Input
                id="supplierName"
                name="supplierName"
                placeholder="Enter supplier name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="origin">Origin/Location *</Label>
              <Input
                id="origin"
                name="origin"
                placeholder="e.g., Yirgacheffe, Sidamo"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantityKg">Quantity (kg) *</Label>
                <Input
                  id="quantityKg"
                  name="quantityKg"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerKg">Price per kg (ETB) *</Label>
                <Input
                  id="pricePerKg"
                  name="pricePerKg"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
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
              {loading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

