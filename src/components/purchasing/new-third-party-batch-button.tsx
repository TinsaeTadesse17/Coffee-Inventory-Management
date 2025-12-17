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
import { Plus, Truck } from "lucide-react"
import { toast } from "sonner"

export function NewThirdPartyBatchButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        entityName: formData.get("entityName"),
        contactPerson: formData.get("contactPerson"),
        phone: formData.get("phone"),
        origin: formData.get("origin"),
        quantityKg: parseFloat(formData.get("quantityKg") as string),
      }

      const response = await fetch("/api/batches/create-third-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create batch")
      }

      const result = await response.json()
      toast.success(`Third Party Batch created! ID: ${result.batch.batchNumber}`)
      
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create batch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Truck className="h-4 w-4" />
          Receive Third Party Coffee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Receive Third Party Coffee</DialogTitle>
            <DialogDescription>
              Register incoming coffee from another entity for processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="entityName">Entity Name *</Label>
              <Input id="entityName" name="entityName" required placeholder="e.g. Oromia Union" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" name="contactPerson" placeholder="Name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+251..." />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="origin">Origin *</Label>
              <Input id="origin" name="origin" required placeholder="e.g. Yirgacheffe" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantityKg">Estimated Quantity (Kg) *</Label>
              <Input 
                id="quantityKg" 
                name="quantityKg" 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
