"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatWeight, formatNumber } from "@/lib/format-utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";

interface CEOVisualDashboardProps {
  data: any;
}

const funnelConfig = {
  ordered: { label: "Ordered", color: "hsl(var(--chart-1))" },
  warehouse: { label: "Warehouse", color: "hsl(var(--chart-2))" },
  processing: { label: "Processing", color: "hsl(var(--chart-3))" },
  export: { label: "Export Ready", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

const financialConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const originConfig = {
  quantity: { label: "Quantity (Kg)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const qaConfig = {
  pass: { label: "Pass (80-84)", color: "hsl(var(--chart-2))" },
  exceptional: { label: "Exceptional (85+)", color: "hsl(var(--chart-1))" },
  fail: { label: "Fail (<80)", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const processingConfig = {
  export: { label: "Export Grade", color: "hsl(var(--chart-2))" },
  reject: { label: "Reject", color: "hsl(var(--chart-5))" },
  waste: { label: "Waste", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

export function CEOVisualDashboard({ data }: CEOVisualDashboardProps) {
  const { 
    contracts, 
    batches, 
    qualityChecks, 
    processingRuns, 
    additionalCosts, 
    processingCosts, 
    storageCosts, 
    exchangeRate = 120 
  } = data;

  // --- 1. Financial Calculations ---
  const contractRevenue = contracts
    .filter((c: any) => c.approvalStatus === "APPROVED")
    .reduce((sum: number, c: any) => sum + c.quantityKg * (c.pricePerKg || 0), 0);
  
  const serviceRevenue = (processingCosts?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0) +
                         (storageCosts?.reduce((sum: number, c: any) => sum + c.totalCost, 0) || 0);

  const totalRevenue = contractRevenue + serviceRevenue;

  const totalCOGS = batches.reduce((sum: number, b: any) => sum + b.purchaseCost, 0);
  const totalOpEx = additionalCosts?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0;
  const totalExpenses = totalCOGS + totalOpEx;

  const grossProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // --- 2. Timeline Data (Revenue vs Expenses) ---
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const financialTrendData = last6Months.map(date => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthLabel = format(date, "MMM");

    const monthRevenue = contracts
      .filter((c: any) => c.approvalStatus === "APPROVED" && new Date(c.createdAt) >= monthStart && new Date(c.createdAt) <= monthEnd)
      .reduce((sum: number, c: any) => sum + c.quantityKg * (c.pricePerKg || 0), 0);
    
    const monthExpenses = batches
      .filter((b: any) => new Date(b.purchaseDate) >= monthStart && new Date(b.purchaseDate) <= monthEnd)
      .reduce((sum: number, b: any) => sum + b.purchaseCost, 0) +
      (additionalCosts?.filter((c: any) => new Date(c.createdAt) >= monthStart && new Date(c.createdAt) <= monthEnd)
        .reduce((sum: number, c: any) => sum + c.amount, 0) || 0);

    return {
      month: monthLabel,
      revenue: monthRevenue,
      expenses: monthExpenses,
    };
  });

  // --- 3. Progress Bar (Funnel) ---
  const statusCounts = {
    ordered: batches.filter((b: any) => b.status === "ORDERED").length,
    warehouse: batches.filter((b: any) => ["AT_GATE", "WEIGHED", "AT_WAREHOUSE", "SAMPLED", "LAB_TESTED", "STORED"].includes(b.status)).length,
    processing: batches.filter((b: any) => b.status === "PROCESSING").length,
    export: batches.filter((b: any) => ["PROCESSED", "EXPORT_READY", "SHIPPED"].includes(b.status)).length,
  };

  const funnelData = [
    { status: "ordered", count: statusCounts.ordered, fill: "var(--color-ordered)" },
    { status: "warehouse", count: statusCounts.warehouse, fill: "var(--color-warehouse)" },
    { status: "processing", count: statusCounts.processing, fill: "var(--color-processing)" },
    { status: "export", count: statusCounts.export, fill: "var(--color-export)" },
  ];

  // --- 4. Origin Performance ---
  const originStats: Record<string, number> = {};
  batches.forEach((b: any) => {
    originStats[b.origin] = (originStats[b.origin] || 0) + (b.currentQuantityKg || b.purchasedQuantityKg);
  });
  
  const originData = Object.entries(originStats)
    .map(([name, value]) => ({ name, quantity: value }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // --- 5. QA Stats ---
  const qaStats = {
    pass: qualityChecks.filter((qc: any) => (qc.totalScore || 0) >= 80).length,
    fail: qualityChecks.filter((qc: any) => (qc.totalScore || 0) < 80).length,
    exceptional: qualityChecks.filter((qc: any) => (qc.totalScore || 0) >= 85).length,
  };
  
  const qaData = [
    { status: "pass", count: qaStats.pass - qaStats.exceptional, fill: "var(--color-pass)" },
    { status: "exceptional", count: qaStats.exceptional, fill: "var(--color-exceptional)" },
    { status: "fail", count: qaStats.fail, fill: "var(--color-fail)" },
  ].filter(d => d.count > 0);

  // --- 6. Processing Stats ---
  const totalExport = processingRuns.reduce((sum: number, r: any) => sum + (r.exportQuantity || 0), 0);
  const totalReject = processingRuns.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0);
  const totalWaste = processingRuns.reduce((sum: number, r: any) => sum + (r.wasteQuantity || 0), 0);

  const processingData = [
    { type: "export", value: totalExport, fill: "var(--color-export)" },
    { type: "reject", value: totalReject, fill: "var(--color-reject)" },
    { type: "waste", value: totalWaste, fill: "var(--color-waste)" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalRevenue / exchangeRate, "USD")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalExpenses / exchangeRate, "USD")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(grossProfit)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(profitMargin)}% Margin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.filter((b: any) => b.status !== "SHIPPED").length}</div>
            <p className="text-xs text-muted-foreground">
              In pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Progress Bar & Financial Trend */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Coffee Pipeline Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="min-h-[300px] w-full">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="status" 
                  type="category" 
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => funnelConfig[value as keyof typeof funnelConfig]?.label as string}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={financialConfig} className="min-h-[300px] w-full">
              <LineChart data={financialTrendData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-revenue)" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="var(--color-expenses)" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Origin & QA */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volume by Origin (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={originConfig} className="min-h-[300px] w-full">
              <BarChart data={originData} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4}>
                  <LabelList
                    dataKey="quantity"
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => formatWeight(value)}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quality Assurance Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={qaConfig} className="min-h-[300px] w-full">
              <PieChart>
                <Pie
                  data={qaData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <LabelList
                    dataKey="status"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: keyof typeof qaConfig) =>
                      qaConfig[value]?.label
                    }
                  />
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Processing & Warehouse */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Processing Output Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={processingConfig} className="min-h-[300px] w-full">
              <PieChart>
                <Pie
                  data={processingData}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  strokeWidth={5}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent nameKey="type" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Stock Aging</CardTitle>
          </CardHeader>
          <CardContent>
             {/* Simple stat for now, could be a chart */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Fresh Stock (&lt; 3 months)</span>
                    </div>
                    <span className="font-bold">
                        {batches.filter((b: any) => ["AT_WAREHOUSE", "STORED"].includes(b.status) && !b.isAging).length} Batches
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>Aging Stock (&gt; 6 months)</span>
                    </div>
                    <span className="font-bold text-yellow-600">
                        {batches.filter((b: any) => b.isAging).length} Batches
                    </span>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Total Stock Value</div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(batches
                            .filter((b: any) => ["AT_WAREHOUSE", "STORED", "PROCESSED"].includes(b.status))
                            .reduce((sum: number, b: any) => sum + b.purchaseCost, 0)
                        )}
                    </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
