"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type WeightUnit = "KILOGRAM" | "FERESULA" | "JUTE_BAG"
export type JuteBagSize = "KG_60" | "KG_50" | "KG_30" | "KG_85"

interface WeightInputProps {
  value?: number
  onChange: (value: number, meta: { unit: WeightUnit, bagSize?: JuteBagSize, count?: number }) => void
  className?: string
}

export function WeightInput({ value, onChange, className }: WeightInputProps) {
  const [unit, setUnit] = useState<WeightUnit>("KILOGRAM")
  const [bagSize, setBagSize] = useState<JuteBagSize>("KG_60")
  const [count, setCount] = useState<string>("")

  useEffect(() => {
    calculateWeight()
  }, [unit, bagSize, count])

  const calculateWeight = () => {
    const numCount = parseFloat(count)
    if (isNaN(numCount)) {
      onChange(0, { unit, bagSize: unit === "JUTE_BAG" ? bagSize : undefined, count: 0 })
      return
    }

    let weight = 0
    if (unit === "KILOGRAM") {
      weight = numCount
    } else if (unit === "FERESULA") {
      weight = numCount * 17
    } else if (unit === "JUTE_BAG") {
      const size = parseInt(bagSize.replace("KG_", ""))
      weight = numCount * size
    }

    onChange(weight, { 
      unit, 
      bagSize: unit === "JUTE_BAG" ? bagSize : undefined, 
      count: numCount 
    })
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Unit</Label>
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="KILOGRAM">Kilograms (kg)</option>
            <option value="FERESULA">Feresula (17kg)</option>
            <option value="JUTE_BAG">Jute Bag</option>
          </select>
        </div>

        {unit === "JUTE_BAG" && (
          <div className="space-y-2">
            <Label>Bag Size</Label>
            <select 
              value={bagSize} 
              onChange={(e) => setBagSize(e.target.value as JuteBagSize)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="KG_60">60 kg (Export)</option>
              <option value="KG_50">50 kg (Export)</option>
              <option value="KG_30">30 kg (Export)</option>
              <option value="KG_85">85 kg (Reject)</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          {unit === "KILOGRAM" ? "Weight (kg)" : "Count"}
        </Label>
        <Input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder={unit === "KILOGRAM" ? "Enter weight..." : "Enter count..."}
          step={unit === "KILOGRAM" ? "0.01" : "1"}
        />
        {unit !== "KILOGRAM" && count && (
          <p className="text-sm text-muted-foreground">
            Total: {(parseFloat(count) * (unit === "FERESULA" ? 17 : parseInt(bagSize.replace("KG_", "")))).toFixed(2)} kg
          </p>
        )}
      </div>
    </div>
  )
}
