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
import { Plus, Trash2, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { BatchSelector } from "@/components/ui/batch-selector"
import { WeightInput, WeightUnit, JuteBagSize } from "@/components/ui/weight-input"
import { differenceInDays } from "date-fns"

export function NewProcessingRunButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inputs, setInputs] = useState<{ id: string; batchId: string; weight: string }[]>([
    { id: "1", batchId: "", weight: "" }
  ])
  const [processType, setProcessType] = useState("EXPORT")
  const [batchDetails, setBatchDetails] = useState<Record<string, any>>({})
  const [additionalCosts, setAdditionalCosts] = useState<{ type: string; amount: string }[]>([])
  
  // Cost Rates
  const [storageRatePerBag, setStorageRatePerBag] = useState("5") // Default 5 ETB/day/bag
  const [processingRatePerTon, setProcessingRatePerTon] = useState("2200")

  // Fetch batch details when selected
  useEffect(() => {
    const fetchBatchDetails = async (batchId: string) => {
      if (!batchId || batchDetails[batchId]) return
      try {
        // We need an endpoint to get single batch, or use existing list endpoint
        // Assuming /api/batches?id=... works or we can filter from a list
        // For now, let's assume we can get it via the selector context or a new fetch
        // Since BatchSelector doesn't expose the full object, we'll fetch it.
        // Actually, let's use a direct fetch to a new endpoint or existing one.
        // We don't have a single batch endpoint yet, let's use the list endpoint with filter
        const response = await fetch(`/api/batches?query=${batchId}`)
        if (response.ok) {
          const data = await response.json()
          const batch = data.batches.find((b: any) => b.id === batchId)
          if (batch) {
            setBatchDetails(prev => ({ ...prev, [batchId]: batch }))
          }
        }
      } catch (e) {
        console.error("Failed to fetch batch details", e)
      }
    }

    inputs.forEach(input => {
      if (input.batchId) fetchBatchDetails(input.batchId)
    })
  }, [inputs, batchDetails])

  const hasThirdPartyBatch = inputs.some(i => batchDetails[i.batchId]?.isThirdParty)

  const addInput = () => {
    setInputs([...inputs, { id: Math.random().toString(), batchId: "", weight: "" }])
  }

  const removeInput = (id: string) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter(i => i.id !== id))
    }
  }

  const updateInput = (id: string, field: 'batchId' | 'weight', value: string) => {
    setInputs(inputs.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const addCost = () => {
    setAdditionalCosts([...additionalCosts, { type: "Moving Cost", amount: "" }])
  }

  const removeCost = (index: number) => {
    setAdditionalCosts(additionalCosts.filter((_, i) => i !== index))
  }

  const updateCost = (index: number, field: 'type' | 'amount', value: string) => {
    setAdditionalCosts(additionalCosts.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // Calculate estimated costs
  const calculateStorageCost = (batchId: string, weight: number) => {
    const batch = batchDetails[batchId]
    if (!batch || !batch.isThirdParty || !batch.warehouseEntryDate) return null
    
    const days = differenceInDays(new Date(), new Date(batch.warehouseEntryDate))
    const billableDays = Math.max(0, days - 15)
    const bags = Math.ceil(weight / 60) // Approx 60kg bags
    const cost = billableDays * bags * parseFloat(storageRatePerBag || "0")
    
    return { days, billableDays, bags, cost }
  }

  const calculateProcessingCost = (weight: number) => {
    const tons = weight / 1000
    return tons * parseFloat(processingRatePerTon || "0")
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const validInputs = inputs.filter(i => i.batchId && i.weight && parseFloat(i.weight) > 0)
      
      if (validInputs.length === 0) {
        toast.error("Please add at least one valid batch and weight")
        setLoading(false)
        return
      }

      // Prepare costs
      const processingCosts = [...additionalCosts]
      const storageCosts: { batchId: string; startDate: Date; days: number; bags: number; amount: number }[] = []

      if (hasThirdPartyBatch) {
        // Add calculated processing cost
        const totalWeight = validInputs.reduce((sum, i) => sum + parseFloat(i.weight), 0)
        processingCosts.push({
          type: `Processing Fee (${processingRatePerTon}/ton)`,
          amount: calculateProcessingCost(totalWeight).toString()
        })

        // Add storage costs
        validInputs.forEach(input => {
          const sc = calculateStorageCost(input.batchId, parseFloat(input.weight))
          if (sc && sc.cost > 0) {
            storageCosts.push({
              batchId: input.batchId,
              startDate: batchDetails[input.batchId].warehouseEntryDate,
              days: sc.days,
              bags: sc.bags,
              amount: sc.cost
            })
            // Also add to processing costs for visibility/invoicing
            processingCosts.push({
              type: `Storage Fee (${sc.billableDays} days, ${sc.bags} bags)`,
              amount: sc.cost.toString()
            })
          }
        })
      }

      const payload = {
        inputs: validInputs.map(i => ({
          batchId: i.batchId,
          weight: parseFloat(i.weight)
        })),
        processType,
        processingCosts,
        storageCosts
      }

      const response = await fetch("/api/processing/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create processing run")
      }

      const result = await response.json()
      toast.success(`Processing run started! Run ID: ${result.processingRun.runNumber}`)
      
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[calc(90vh-8rem)]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>New Processing Run</DialogTitle>
            <DialogDescription>
              Start a new coffee processing operation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Input Batches</Label>
                <Button type="button" variant="outline" size="sm" onClick={addInput}>
                  <Plus className="h-3 w-3 mr-1" /> Add Batch
                </Button>
              </div>
              
              {inputs.map((input, index) => (
                <div key={input.id} className="p-3 border rounded-md space-y-3 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Input #{index + 1}</span>
                    {inputs.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-red-500 hover:text-red-600"
                        onClick={() => removeInput(input.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor={`batch-${input.id}`}>Batch ID *</Label>
                    <BatchSelector
                      value={input.batchId}
                      onChange={(val) => updateInput(input.id, 'batchId', val)}
                      filter={(batch) => {
                        return batch.status === "STORED";
                      }}
                      className="w-full"
                    />
                    {batchDetails[input.batchId]?.isThirdParty && (
                      <div className="text-xs text-blue-600 font-medium">
                        Third Party: {batchDetails[input.batchId].thirdPartyEntity?.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Weight to Process *</Label>
                    <WeightInput
                      value={input.weight ? parseFloat(input.weight) : 0}
                      onChange={(val) => updateInput(input.id, 'weight', val.toString())}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 mt-2">
              <Label htmlFor="processType">Process Type *</Label>
              <select
                id="processType"
                name="processType"
                value={processType}
                onChange={(e) => setProcessType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select process type</option>
                <option value="EXPORT">Export Grade</option>
                <option value="REJECT">Reject</option>
              </select>
            </div>

            {hasThirdPartyBatch && (
              <div className="border-t pt-4 mt-2 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Third Party Costs
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Processing Rate (ETB/Ton)</Label>
                    <Input 
                      type="number" 
                      value={processingRatePerTon} 
                      onChange={(e) => setProcessingRatePerTon(e.target.value)} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Storage Rate (ETB/Bag/Day)</Label>
                    <Input 
                      type="number" 
                      value={storageRatePerBag} 
                      onChange={(e) => setStorageRatePerBag(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Costs</Label>
                  {additionalCosts.map((cost, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={cost.type}
                        onChange={(e) => updateCost(index, 'type', e.target.value)}
                      >
                        <option value="Moving Cost">Moving Cost</option>
                        <option value="Processing Grade 1">Processing Grade 1</option>
                        <option value="Processing Grade 2">Processing Grade 2</option>
                        <option value="Processing Grade 3">Processing Grade 3</option>
                        <option value="Weighing Fee">Weighing Fee</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={cost.amount}
                        onChange={(e) => updateCost(index, 'amount', e.target.value)}
                        className="w-32"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCost(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addCost} className="w-full">
                    <Plus className="h-3 w-3 mr-2" /> Add Cost
                  </Button>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <div className="font-medium">Estimated Total:</div>
                  {inputs.map(input => {
                    if (!input.batchId || !input.weight) return null
                    const sc = calculateStorageCost(input.batchId, parseFloat(input.weight))
                    if (!sc) return null
                    return (
                      <div key={input.id} className="flex justify-between text-muted-foreground">
                        <span>Storage ({sc.billableDays} days billable):</span>
                        <span>{sc.cost.toFixed(2)} ETB</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing Fee:</span>
                    <span>
                      {calculateProcessingCost(inputs.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0)).toFixed(2)} ETB
                    </span>
                  </div>
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
              {loading ? "Starting..." : "Start Processing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

