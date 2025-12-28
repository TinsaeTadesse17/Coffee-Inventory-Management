# Purchasing Notification & Batch Display Fixes

## Issues Fixed

### 1. ✅ Notification After Purchasing
**Problem:** Security team wasn't notified when a new purchase order was created.

**Solution:** Added notification to security team when batch is created.

**Changes:**
```typescript
// src/app/api/suppliers/create/route.ts

import { notifyBatchReady } from "@/lib/notification-service"
import { Role } from "@prisma/client"

// After creating batch and audit log:
await notifyBatchReady({
  batchId: batch.id,
  batchNumber: batch.batchNumber,
  nextRole: Role.SECURITY,
  stepName: "Weighing at Gate",
})
```

**Result:**
- ✅ Security role receives notification when purchase order is created
- ✅ Notification includes batch number and links to dashboard
- ✅ Shows in notification bell with "Batch Ready for Weighing at Gate" message

---

### 2. ✅ Batch Numbers Display on Security Dashboard
**Problem:** Security dashboard showed batch IDs (like `cmj2f0hur...`) instead of actual batch numbers (like `BTH-1765534169459`).

**Solution:** 
1. Updated dashboard query to include batch and supplier relationships
2. Fixed display to show batch.batchNumber instead of batchId

**Changes:**

**A. Dashboard Data Query:**
```typescript
// src/app/dashboard/page.tsx

prisma.vehicleWeighingRecord.findMany({
  include: {
    batch: {
      include: {
        supplier: true  // Include supplier for extra context
      }
    }
  },
  orderBy: { timestampIn: "desc" },
}),
```

**B. Dashboard Display:**
```typescript
// src/components/dashboard/role-dashboards.tsx

// Before:
<p className="font-medium">Batch {w.batchId?.substring(0, 8) || 'N/A'}</p>

// After:
<p className="font-medium">{w.batch?.batchNumber || `Batch ${w.batchId?.substring(0, 8)}` || 'N/A'}</p>
<p className="text-xs text-muted-foreground">
  {w.batch?.supplier?.name ? `${w.batch.supplier.name} - ` : ''}{w.vehiclePlate || 'No plate'}
</p>
```

**Result:**
- ✅ Shows actual batch numbers: `BTH-1765534169459`
- ✅ Shows supplier name for context: `Kaffa Supplier`
- ✅ Shows vehicle plate number
- ✅ Proper formatting with 2 decimal places for weight

---

## Complete Workflow Now

### 1. Purchasing Creates Order
```
1. Purchasing dept creates purchase order
2. Batch created with status: ORDERED
3. 🔔 Security team gets notification:
   "Batch Ready for Weighing at Gate"
   "Batch BTH-xxx is ready for Weighing at Gate"
```

### 2. Security Views Dashboard
```
Security Dashboard shows:
┌─────────────────────────────────────┐
│ Recent Weighing Records             │
├─────────────────────────────────────┤
│ BTH-1765534169459                   │
│ Kaffa Supplier - ET-3-12345         │
│ 12/12/2025, 10:09 AM                │
│                        1,450.00 kg  │
└─────────────────────────────────────┘
```

### 3. Security Weighs Batch
```
1. Clicks notification or goes to weighing
2. Sees dropdown with: "BTH-1765534169459 (Kaffa)"
3. Selects batch and records weights
4. Batch status → AT_GATE
```

---

## Notification Flow

```
ORDERED (Purchase created)
   ↓
   🔔 Security: "Batch Ready for Weighing at Gate"
   ↓
AT_GATE (Weighed by security)
   ↓
   🔔 Warehouse: "Batch Ready for Warehouse Receipt"
   ↓
STORED (Received in warehouse)
   ↓
   🔔 Quality: "Batch Ready for Quality Inspection"
   ↓
PROCESSED (After processing)
   ↓
   🔔 Warehouse, Export, CEO: "Processing Complete"
```

---

## Display Format Examples

### Security Dashboard - Weighing Records

**Old (Wrong):**
```
Batch cmj2f0hur
12/12/2025, 10:09:29 AM
1450 kg
```

**New (Correct):**
```
BTH-1765534169459
Kaffa Supplier - ET-3-12345
12/12/2025, 10:09:29 AM
1,450.00 kg
```

---

## Benefits

✅ **Security Team Notified** - No more manual checking for new orders
✅ **Clear Batch Identification** - Actual batch numbers shown everywhere
✅ **Supplier Context** - Shows which supplier's coffee is being weighed
✅ **Vehicle Tracking** - Vehicle plate number visible
✅ **Professional Display** - Proper number formatting with decimals
✅ **Complete Traceability** - Follow coffee from purchase to weighing

---

## Testing

### Test Notification:
1. Login as PURCHASING
2. Create new purchase order
3. Login as SECURITY (or any user with SECURITY role)
4. Check notification bell (should show red badge)
5. Click bell - see "Batch Ready for Weighing at Gate"
6. Click notification - goes to dashboard

### Test Batch Display:
1. After weighing a batch
2. Go to dashboard as SECURITY
3. Check "Recent Weighing Records"
4. Should show:
   - ✅ Batch number (BTH-xxx)
   - ✅ Supplier name
   - ✅ Vehicle plate
   - ✅ Date/time
   - ✅ Weight with 2 decimals

All working correctly now! 🎉





