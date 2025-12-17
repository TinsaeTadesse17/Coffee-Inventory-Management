import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: string): string {
  // Generate 6 random digits
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  // Format as 000-000
  const formatted = `${random.slice(0, 3)}-${random.slice(3)}`
  return `${prefix}-${formatted}`
}

