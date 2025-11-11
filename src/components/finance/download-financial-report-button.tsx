"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function DownloadFinancialReportButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      console.log("Starting download...")
      
      // Create a temporary form to POST to the API
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/api/reports/financial'
      form.style.display = 'none'
      
      document.body.appendChild(form)
      form.submit()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(form)
      }, 1000)
      
      // Show success message after a short delay
      setTimeout(() => {
        toast.success("Financial report downloaded successfully!")
        setLoading(false)
      }, 500)
      
    } catch (error) {
      console.error("Download error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to download report")
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleDownload} 
      variant="outline"
      disabled={loading}
    >
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Generating..." : "Download Financial Report"}
    </Button>
  )
}
