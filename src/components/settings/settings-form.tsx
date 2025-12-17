
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exchangeRate, setExchangeRate] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      if (!res.ok) throw new Error("Failed to fetch settings")
      const data = await res.json()
      setExchangeRate(data.exchangeRate.toString())
    } catch (error) {
      console.error(error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchangeRate: parseFloat(exchangeRate) }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="exchangeRate">Current Exchange Rate (ETB to USD)</Label>
        <Input
          id="exchangeRate"
          type="number"
          step="0.01"
          value={exchangeRate}
          onChange={(e) => setExchangeRate(e.target.value)}
          placeholder="e.g. 120.00"
          required
        />
        <p className="text-xs text-muted-foreground">
          This rate will be used for new transactions. Existing records are not affected.
        </p>
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
