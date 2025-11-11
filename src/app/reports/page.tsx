import { requireAuth } from "@/lib/auth-helpers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

export default async function ReportsPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and download reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base">Daily Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Overview of today's activities and key metrics
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base">Weight Loss Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed weight loss analysis across checkpoints
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base">Aging Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coffee batches by days in warehouse
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base">Revenue by Origin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Revenue breakdown by coffee origin
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base">QC Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quality check pass rates and moisture analysis
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="text-base">Custom Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Build your own report with custom filters
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}








