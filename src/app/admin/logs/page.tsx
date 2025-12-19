import { prisma } from "@/lib/prisma"
import { requireRoles } from "@/lib/auth-helpers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

export default async function LogsPage() {
  await requireRoles(["ADMIN"])
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { timestamp: 'desc' },
    take: 100 // Limit to last 100 logs
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">System activity history</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>{log.entity} ({log.entityId.substring(0, 8)}...)</TableCell>
                <TableCell>{log.user?.name || 'System'}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
                <TableCell className="max-w-xs truncate" title={log.changes || ''}>
                  {log.changes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
