"use client"

import { useState, useEffect } from "react"
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
import { Plus, AlertTriangle, CheckCircle2, Minus } from "lucide-react"
import { toast } from "sonner"
import { BatchSelector } from "@/components/ui/batch-selector"
import { WeightInput, WeightUnit, JuteBagSize } from "@/components/ui/weight-input"

const warehouseEntryOptions = [
  { value: "ARRIVAL", label: "Arrival" },
  { value: "REJECT", label: "Reject" },
  { value: "EXPORT", label: "Export Dispatch" },
] as const

type WarehouseEntryType = (typeof warehouseEntryOptions)[number]["value"]

interface WeighingRecord {
  id: string
  netWeight: number | null
  grossWeightIn: number
  vehiclePlate: string
  timestampIn: string
  batch: {
    batchNumber: string
    supplier?: {
      name: string
    }
    thirdPartyEntity?: {
      name: string
    }
  }
}

export function ReceiveBatchButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState("")
  const [receivedWeight, setReceivedWeight] = useState("")
  const [entryType, setEntryType] = useState<WarehouseEntryType>("ARRIVAL")
  const [storageLocations, setStorageLocations] = useState<string[]>([""])
  const [weighingRecord, setWeighingRecord] = useState<WeighingRecord | null>(null)
  const [fetchingRecord, setFetchingRecord] = useState(false)
  const [weightMeta, setWeightMeta] = useState<{ unit: WeightUnit, bagSize?: JuteBagSize, count?: number }>({ unit: "KILOGRAM" })

  // Fetch weighing record when batch ID changes
  useEffect(() => {
    if (!batchId || batchId.trim() === "") {
      setWeighingRecord(null)
      return
    }

    const fetchWeighingRecord = async () => {
      setFetchingRecord(true)
      try {
        const response = await fetch(`/api/warehouse/weighing-record?batchId=${encodeURIComponent(batchId)}`)
        if (response.ok) {
          const data = await response.json()
          setWeighingRecord(data.weighingRecord)
        } else {
          setWeighingRecord(null)
        }
      } catch (error) {
        console.error("Failed to fetch weighing record:", error)
        setWeighingRecord(null)
      } finally {
        setFetchingRecord(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchWeighingRecord, 500)
    return () => clearTimeout(timeoutId)
  }, [batchId])

  const shouldVerifyWeight = entryType === "ARRIVAL"
  const weightDifference = shouldVerifyWeight && weighingRecord?.netWeight && receivedWeight
    ? Math.abs(parseFloat(receivedWeight) - weighingRecord.netWeight)
    : null

  const weightDifferencePercent = shouldVerifyWeight && weighingRecord?.netWeight && receivedWeight && weighingRecord.netWeight > 0
    ? (weightDifference! / weighingRecord.netWeight) * 100
    : null

  const hasWeightMismatch = weightDifference !== null && weightDifference > 0.1 // Allow 0.1kg tolerance

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
      const filteredLocations = storageLocations.map(loc => loc.trim()).filter(Boolean)

      if (filteredLocations.length === 0) {
        toast.error("Please add at least one storage location")
        setLoading(false)
        return
      }

      const data = {
        batchId,
        storageLocations: filteredLocations,
        entryType,
        receivedWeight: parseFloat(receivedWeight),
        measurementType: weightMeta.unit,
        juteBagSize: weightMeta.bagSize,
        juteBagCount: weightMeta.unit === "JUTE_BAG" ? weightMeta.count : undefined,
        feresulaBags: weightMeta.unit === "FERESULA" ? weightMeta.count : undefined,
        bags: weightMeta.unit === "JUTE_BAG" ? weightMeta.count : formData.get("bags"),
        notes: formData.get("notes"),
      }

      const response = await fetch("/api/warehouse/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to receive batch")
      }

      toast.success("Batch received successfully in warehouse!")
      
      // Reset form
      setBatchId("")
      setReceivedWeight("")
      setEntryType("ARRIVAL")
      setStorageLocations([""])
      setWeighingRecord(null)
      
      // Close dialog and refresh page
      setOpen(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Warehouse receive error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to receive batch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Receive Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[calc(90vh-8rem)]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Receive Batch in Warehouse</DialogTitle>
            <DialogDescription>
              Record batch movement and assign storage locations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            <div className="grid gap-2">
              <Label htmlFor="batchId">Batch ID *</Label>
              <BatchSelector
                value={batchId}
                onChange={setBatchId}
                filter={(batch) => batch.status === "AT_GATE" || batch.status === "ORDERED"}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only batches that have been weighed at the gate appear here
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entryType">Warehouse Entry Type *</Label>
              <select
                id="entryType"
                name="entryType"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={entryType}
                onChange={(event) => setEntryType(event.target.value as WarehouseEntryType)}
              >
                {warehouseEntryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Choose how this batch is moving through the warehouse.
              </p>
            </div>

            {/* Weighing Record Display */}
            {shouldVerifyWeight && fetchingRecord && (
              <div className="text-sm text-muted-foreground">Loading weighing record...</div>
            )}
            
            {shouldVerifyWeight && weighingRecord && !fetchingRecord && (
              <div className="p-3 bg-muted rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">Weighing Record Found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Batch: {weighingRecord.batch.batchNumber} • {weighingRecord.batch.supplier?.name || weighingRecord.batch.thirdPartyEntity?.name || 'Unknown'}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Net Weight:</span>
                    <span className="ml-2 font-semibold">
                      {weighingRecord.netWeight ? `${weighingRecord.netWeight.toFixed(2)} kg` : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="ml-2">{weighingRecord.vehiclePlate}</span>
                  </div>
                </div>
              </div>
            )}

            {!weighingRecord && !fetchingRecord && batchId && shouldVerifyWeight && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No weighing record found for this batch. Ensure batch was weighed at gate first.</span>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Storage Locations *</Label>
              <div className="space-y-2">
                {storageLocations.map((location, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={location}
                      onChange={(event) => {
                        const updated = [...storageLocations]
                        updated[index] = event.target.value
                        setStorageLocations(updated)
                      }}
                      placeholder="e.g., Warehouse A - Bay 3"
                      required={index === 0}
                    />
                    {storageLocations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 w-9"
                        onClick={() => {
                          setStorageLocations((prev) => prev.filter((_, i) => i !== index))
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStorageLocations((prev) => [...prev, ""])}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add one or multiple locations if the batch is split across zones.
              </p>
            </div>
            <div className="grid gap-2">
              <WeightInput 
                value={parseFloat(receivedWeight)}
                onChange={(val, meta) => {
                  setReceivedWeight(val.toString())
                  setWeightMeta(meta)
                }}
              />
            </div>
            
            {weightMeta.unit !== "JUTE_BAG" && (
              <div className="grid gap-2">
                <Label htmlFor="bags">Number of Bags</Label>
                <Input
                  id="bags"
                  name="bags"
                  type="number"
                  placeholder="0"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Condition, handling notes, etc."
              />
            </div>

            {/* Weight Verification Warning */}
            {shouldVerifyWeight && hasWeightMismatch && weighingRecord?.netWeight && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Weight Mismatch Detected!</p>
                    <p className="text-xs text-red-700 mt-1">
                      Weighing record: <strong>{weighingRecord.netWeight.toFixed(2)} kg</strong>
                      <br />
                      Entered weight: <strong>{parseFloat(receivedWeight).toFixed(2)} kg</strong>
                      <br />
                      Difference: <strong>{weightDifference?.toFixed(2)} kg ({weightDifferencePercent?.toFixed(2)}%)</strong>
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Please verify the weight before confirming receipt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {shouldVerifyWeight && !hasWeightMismatch && weighingRecord?.netWeight && receivedWeight && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Weight matches weighing record ✓</span>
                </div>
              </div>
            )}
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
              {loading ? "Receiving..." : "Receive Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

