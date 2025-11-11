"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ContractApprovalButtonsProps {
  contractId: string
  currentStatus: string
}

export function ContractApprovalButtons({ contractId, currentStatus }: ContractApprovalButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!contractId) {
    console.error("ContractApprovalButtons: contractId is undefined")
    return <div className="text-xs text-muted-foreground">Invalid contract</div>
  }

  const handleApproval = async (action: "APPROVE" | "REJECT") => {
    if (!contractId) {
      toast.error("Contract ID is missing")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/contracts/${contractId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${action.toLowerCase()} contract`)
      }

      toast.success(`Contract ${action === "APPROVE" ? "approved" : "rejected"} successfully`)

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error(`Failed to ${action.toLowerCase()} contract:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action.toLowerCase()} contract`)
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus !== "PENDING") {
    return (
      <div className="text-xs text-muted-foreground">
        {currentStatus === "APPROVED" ? (
          <span className="text-green-600">✓ Approved</span>
        ) : currentStatus === "REJECTED" ? (
          <span className="text-red-600">✗ Rejected</span>
        ) : (
          currentStatus
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={() => handleApproval("APPROVE")}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        <span className="ml-1">Approve</span>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleApproval("REJECT")}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        <span className="ml-1">Reject</span>
      </Button>
    </div>
  )
}

