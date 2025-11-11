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

export function NewContractButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        buyerName: formData.get("buyerName"),
        buyerEmail: formData.get("buyerEmail"),
        destinationCountry: formData.get("destinationCountry"),
        coffeeType: formData.get("coffeeType"),
        gradeSpec: formData.get("gradeSpec"),
        quantityKg: parseFloat(formData.get("quantityKg") as string),
        pricePerKg: formData.get("pricePerKg") ? parseFloat(formData.get("pricePerKg") as string) : undefined,
        shippingDate: formData.get("shippingDate"),
        paymentMethod: formData.get("paymentMethod"),
      }

      const response = await fetch("/api/contracts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create contract")
      }

      const result = await response.json()
      toast.success(`Contract ${result.contract.contractNumber} created (${result.contract.paymentMethod}). Awaiting CEO approval.`)
      
      // Close dialog and refresh page
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Contract creation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create contract")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New Export Contract</DialogTitle>
            <DialogDescription>
              Create a new contract with a buyer. Requires CEO approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buyerName">Buyer Name *</Label>
                <Input
                  id="buyerName"
                  name="buyerName"
                  placeholder="Enter buyer/importer name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buyerEmail">Buyer Email</Label>
                <Input
                  id="buyerEmail"
                  name="buyerEmail"
                  type="email"
                  placeholder="buyer@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="destinationCountry">Destination Country *</Label>
                <Input
                  id="destinationCountry"
                  name="destinationCountry"
                  placeholder="e.g., Germany"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coffeeType">Coffee Type *</Label>
                <Input
                  id="coffeeType"
                  name="coffeeType"
                  placeholder="e.g., Arabica Natural"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="pricePerKg">Price per kg (USD) *</Label>
                <Input
                  id="pricePerKg"
                  name="pricePerKg"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gradeSpec">Grade / Specification</Label>
                <Input
                  id="gradeSpec"
                  name="gradeSpec"
                  placeholder="e.g., Grade 1, 85+ SCA"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="shippingDate">Target Shipping Date</Label>
                <Input
                  id="shippingDate"
                  name="shippingDate"
                  type="date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue="TT"
                  required
                >
                  <option value="TT">TT (Telegraphic Transfer)</option>
                  <option value="LC">LC (Letter of Credit)</option>
                  <option value="CAD">CAD (Cash Against Documents)</option>
                </select>
              </div>
            </div>
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Contract details can be refined after CEO approval. Ensure payment method aligns with buyer agreement.
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
              {loading ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

