"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User } from "lucide-react"
import { getRoleDisplayName } from "@/lib/auth-helpers"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h2 className="text-lg font-semibold">Coffee Supply Chain Dashboard</h2>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {session?.user && (
            <div className="hidden lg:block text-sm">
              <div className="font-medium">{session.user.name}</div>
              <div className="text-muted-foreground text-xs">
                {getRoleDisplayName(session.user.role)}
              </div>
            </div>
          )}
          
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const origin = typeof window !== "undefined" ? window.location.origin : ""
              const callbackUrl = origin ? `${origin}/login` : "/login"
              signOut({ callbackUrl })
            }}
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}








