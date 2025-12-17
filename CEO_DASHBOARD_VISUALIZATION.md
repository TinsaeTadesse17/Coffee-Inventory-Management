# CEO Dashboard Visualization Update

## Overview
The CEO Dashboard has been upgraded with rich visualizations to provide a quick, high-level overview of the business performance.

## New Features
1. **KPI Cards**:
   - Total Revenue (Contracts + Service Revenue)
   - Total Expenses (COGS + OpEx)
   - Gross Profit & Margin
   - Active Batches in Pipeline

2. **Visual Charts (Recharts)**:
   - **Pipeline Funnel**: Bar chart showing batch counts at each stage (Ordered -> Warehouse -> Processing -> Export).
   - **Financial Trend**: Line chart showing Revenue vs Expenses over the last 6 months.
   - **Origin Performance**: Bar chart showing top 5 origins by volume.
   - **Quality Stats**: Pie chart showing pass/fail/exceptional rates.
   - **Processing Output**: Pie chart showing Export vs Reject vs Waste.

3. **Integration**:
   - The new `CEOVisualDashboard` component is integrated into `EnhancedCEODashboard`.
   - Existing "Pending Contract Approvals" and "Comprehensive Batch Details" sections are preserved.

## Technical Details
- **Library**: `recharts`
- **Components**: `BarChart`, `LineChart`, `PieChart`
- **Data Source**: Aggregated from `contracts`, `batches`, `processingRuns`, `qualityChecks`, `processingCosts`, `storageCosts`.

## Next Steps
- User feedback on the charts.
- Potential drill-down capabilities (clicking a chart bar to see details).
