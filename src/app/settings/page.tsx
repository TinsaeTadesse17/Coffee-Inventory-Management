
import { requireRoles } from "@/lib/auth-helpers"
import { Role } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SettingsForm } from "@/components/settings/settings-form"
import { JuteBagInventoryManager } from "@/components/settings/jute-bag-inventory"

export default async function SettingsPage() {
  const user = await requireRoles([Role.ADMIN, Role.CEO, Role.WAREHOUSE])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and inventory.</p>
      </div>

      <div className="grid gap-6">
        {(user.role === Role.ADMIN || user.role === Role.CEO) && (
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Global settings for the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Jute Bag Inventory</CardTitle>
            <CardDescription>Manage stock levels for different bag sizes.</CardDescription>
          </CardHeader>
          <CardContent>
            <JuteBagInventoryManager canEdit={user.role === Role.ADMIN || user.role === Role.CEO || user.role === Role.WAREHOUSE} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
