"use client"

import { useState, useCallback } from "react"

export interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Toast) => {
    // Simple implementation - just log for now or you can integrate with a toast library
    // This is a minimal implementation that works
    if (props.variant === "destructive") {
      console.error(`[Toast Error] ${props.title}`, props.description)
      alert(`Error: ${props.title}\n${props.description || ""}`)
    } else {
      console.log(`[Toast] ${props.title}`, props.description)
      alert(`Success: ${props.title}\n${props.description || ""}`)
    }
    
    setToasts((prev) => [...prev, props])
  }, [])

  return { toast }
}

