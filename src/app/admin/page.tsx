import { requireRoles } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, FileText, Settings } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  await requireRoles(["ADMIN"])

  const [userCount, logCount] = await Promise.all([
    prisma.user.count(),
    prisma.auditLog.count()
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">System settings and user management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Currently logged in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logCount}</div>
            <p className="text-xs text-muted-foreground">Total system events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/users" className="block">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>User Management</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage users, roles, and permissions
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/logs" className="block">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    View system activity and changes
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Logs
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings" className="block">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>System Settings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure system preferences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
