"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const PROCESSING_TYPES = ["NATURAL", "WASHED", "SPECIAL", "ANAEROBIC", "HONEY"]
const BATCH_STATUSES = [
  "ORDERED", "AT_GATE", "AT_WAREHOUSE", "STORED",
  "PROCESSING_REQUESTED", "IN_PROCESSING", "PROCESSED",
  "EXPORT_READY", "IN_TRANSIT", "SHIPPED", "REJECTED", "REPROCESSING"
]

interface Batch {
  id: string
  batchNumber: string
  origin: string
  grade: string | null
  variety: string | null
  processingType: string
  purchasedQuantityKg: number
  currentQuantityKg: number
  purchaseCost: number
  purchaseCurrency: string
  exchangeRateAtPurchase: number | null
  containerCount: number | null
  status: string
  currentLocation: string | null
}

interface EditBatchDialogProps {
  batch: Batch
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditBatchDialog({ batch, open, onOpenChange }: EditBatchDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    origin: batch.origin,
    grade: batch.grade || "",
    variety: batch.variety || "",
    processingType: batch.processingType,
    purchasedQuantityKg: batch.purchasedQuantityKg,
    currentQuantityKg: batch.currentQuantityKg,
    purchaseCost: batch.purchaseCost,
    purchaseCurrency: batch.purchaseCurrency,
    exchangeRateAtPurchase: batch.exchangeRateAtPurchase || "",
    containerCount: batch.containerCount || "",
    status: batch.status,
    currentLocation: batch.currentLocation || ""
  })
  const router = useRouter()

  useEffect(() => {
    setFormData({
      origin: batch.origin,
      grade: batch.grade || "",
      variety: batch.variety || "",
      processingType: batch.processingType,
      purchasedQuantityKg: batch.purchasedQuantityKg,
      currentQuantityKg: batch.currentQuantityKg,
      purchaseCost: batch.purchaseCost,
      purchaseCurrency: batch.purchaseCurrency,
      exchangeRateAtPurchase: batch.exchangeRateAtPurchase || "",
      containerCount: batch.containerCount || "",
      status: batch.status,
      currentLocation: batch.currentLocation || ""
    })
  }, [batch])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData: any = {
        origin: formData.origin,
        grade: formData.grade || null,
        variety: formData.variety || null,
        processingType: formData.processingType,
        purchasedQuantityKg: parseFloat(formData.purchasedQuantityKg.toString()),
        currentQuantityKg: parseFloat(formData.currentQuantityKg.toString()),
        purchaseCost: parseFloat(formData.purchaseCost.toString()),
        purchaseCurrency: formData.purchaseCurrency,
        exchangeRateAtPurchase: formData.exchangeRateAtPurchase ? parseFloat(formData.exchangeRateAtPurchase.toString()) : null,
        containerCount: formData.containerCount ? parseInt(formData.containerCount.toString()) : null,
        status: formData.status,
        currentLocation: formData.currentLocation || null
      }

      const response = await fetch(`/api/batches/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update batch")
      }

      toast.success("Batch updated successfully")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update batch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Batch: {batch.batchNumber}</DialogTitle>
          <DialogDescription>
            Update batch information. Changes will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., Grade 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  placeholder="e.g., Arabica"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="processingType">Processing Type</Label>
                <select 
                  id="processingType"
                  value={formData.processingType}
                  onChange={(e) => setFormData({ ...formData, processingType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  {PROCESSING_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchasedQuantityKg">Purchased Quantity (kg)</Label>
                <Input
                  id="purchasedQuantityKg"
                  type="number"
                  step="0.01"
                  value={formData.purchasedQuantityKg}
                  onChange={(e) => setFormData({ ...formData, purchasedQuantityKg: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currentQuantityKg">Current Quantity (kg)</Label>
                <Input
                  id="currentQuantityKg"
                  type="number"
                  step="0.01"
                  value={formData.currentQuantityKg}
                  onChange={(e) => setFormData({ ...formData, currentQuantityKg: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchaseCost">Purchase Cost</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  step="0.01"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchaseCurrency">Currency</Label>
                <Input
                  id="purchaseCurrency"
                  value={formData.purchaseCurrency}
                  onChange={(e) => setFormData({ ...formData, purchaseCurrency: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exchangeRateAtPurchase">Exchange Rate (optional)</Label>
                <Input
                  id="exchangeRateAtPurchase"
                  type="number"
                  step="0.0001"
                  value={formData.exchangeRateAtPurchase}
                  onChange={(e) => setFormData({ ...formData, exchangeRateAtPurchase: e.target.value })}
                  placeholder="ETB to USD"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="containerCount">Container Count</Label>
                <Input
                  id="containerCount"
                  type="number"
                  value={formData.containerCount}
                  onChange={(e) => setFormData({ ...formData, containerCount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {BATCH_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currentLocation">Current Location</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="e.g., Warehouse A"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

