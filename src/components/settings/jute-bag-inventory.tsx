
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface JuteBagItem {
  id: string
  size: string
  quantity: number
  pricePerBag: number
  lowStockAlert: number
}

export function JuteBagInventoryManager({ canEdit }: { canEdit: boolean }) {
  const [items, setItems] = useState<JuteBagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [size, setSize] = useState("KG_60")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [alert, setAlert] = useState("50")

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/jute-bags")
      if (!res.ok) throw new Error("Failed to fetch inventory")
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/jute-bags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size,
          quantity: parseInt(quantity),
          pricePerBag: parseFloat(price),
          lowStockAlert: parseInt(alert),
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update inventory")
      }
      
      toast.success("Inventory updated successfully")
      setOpen(false)
      fetchInventory()
      
      // Reset form
      setQuantity("")
      setPrice("")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Update Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Update Jute Bag Stock</DialogTitle>
                  <DialogDescription>
                    Add or update inventory for a specific bag size.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="size">Bag Size</Label>
                    <select
                      id="size"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    >
                      <option value="KG_30">30 KG</option>
                      <option value="KG_50">50 KG</option>
                      <option value="KG_60">60 KG</option>
                      <option value="KG_85">85 KG (Reject)</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Current Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Total count in stock"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price Per Bag (ETB)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Cost per bag"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="alert">Low Stock Alert Threshold</Label>
                    <Input
                      id="alert"
                      type="number"
                      value={alert}
                      onChange={(e) => setAlert(e.target.value)}
                      placeholder="Notify when below this amount"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Inventory
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price (ETB)</TableHead>
              <TableHead>Low Stock Alert</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No inventory records found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.size.replace('KG_', '')} KG</TableCell>
                  <TableCell>{item.quantity.toLocaleString()}</TableCell>
                  <TableCell>{item.pricePerBag.toFixed(2)}</TableCell>
                  <TableCell>{item.lowStockAlert}</TableCell>
                  <TableCell>
                    {item.quantity <= item.lowStockAlert ? (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        OK
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
