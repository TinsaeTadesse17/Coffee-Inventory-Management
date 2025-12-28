# Final Fix: Null Pointer Exception in Purchasing Dashboard

## Issue
The application was crashing with `TypeError: Cannot read properties of null (reading 'name')` on the dashboard.
This was traced to the `PurchasingDashboard` component in `src/components/dashboard/role-dashboards.tsx`.

## Root Cause
The code was accessing `b.supplier.name` directly:
```tsx
<p className="text-xs text-muted-foreground">{b.supplier.name} • {b.origin}</p>
```
However, the `supplier` relation on the `Batch` model is optional (`supplierId String?`), so `b.supplier` can be `null`. When it is null, accessing `.name` throws a runtime error.

## Fix Applied
Updated the code to use optional chaining and a fallback value:
```tsx
<p className="text-xs text-muted-foreground">{b.supplier?.name || 'Unknown Supplier'} • {b.origin}</p>
```

## Verification
- Checked `src/components/dashboard/role-dashboards.tsx` for other unsafe accesses.
- Checked `src/components/warehouse/receive-batch-button.tsx` (already fixed).
- Checked `src/components/dashboard/ceo-visual-dashboard.tsx` (safe).
- Pushed changes to `main` branch.

## Next Steps
- Wait for Render deployment to complete.
- Verify the dashboard loads correctly.
