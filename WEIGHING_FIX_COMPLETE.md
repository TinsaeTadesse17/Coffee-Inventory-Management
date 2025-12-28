# Weighing Batch Selection - Fix Complete

## Issue Fixed
Previously, the weighing system automatically assigned the first available `ORDERED` batch to a weighing record. This was incorrect because:
- ❌ Multiple batches could be ordered but only one would be selected
- ❌ Security couldn't choose which specific batch was arriving
- ❌ No visibility of which purchased batches were awaiting delivery
- ❌ Wrong batch could be weighed if multiple deliveries expected

## Solution Implemented
Security personnel now select the specific purchased batch they are weighing from a dropdown menu.

## Changes Made

### 1. Component: `new-weighing-record-button.tsx`

**Added:**
- ✅ `BatchSelector` component at the top of the form
- ✅ State management for `batchId`
- ✅ Filter to show only `ORDERED` batches
- ✅ Validation to ensure a batch is selected before submission
- ✅ Help text explaining the field

**New Form Field:**
```tsx
<div className="grid gap-2">
  <Label htmlFor="batchId">Batch to Weigh *</Label>
  <BatchSelector
    value={batchId}
    onChange={setBatchId}
    filter={(batch) => batch.status === "ORDERED"}
    className="w-full"
  />
  <p className="text-xs text-muted-foreground">
    Select which purchased batch is arriving for weighing
  </p>
</div>
```

**Validation Added:**
```tsx
if (!batchId) {
  toast.error("Please select a batch")
  setLoading(false)
  return
}
```

### 2. API: `/api/weighing/create/route.ts`

**Before:**
```typescript
// Auto-selected first ORDERED batch
const batch = await prisma.batch.findFirst({
  where: { status: "ORDERED" },
  orderBy: { createdAt: "desc" },
})
```

**After:**
```typescript
// Accepts batchId from form submission
const { batchId, grossWeight, tareWeight, driverName } = data

if (!batchId) {
  return NextResponse.json(
    { error: "Batch ID is required" },
    { status: 400 }
  )
}

// Finds specific batch selected by user
const batch = await prisma.batch.findFirst({
  where: { 
    OR: [
      { id: batchId },
      { batchNumber: batchId }
    ],
    status: "ORDERED"
  },
})

if (!batch) {
  return NextResponse.json(
    { error: `Batch not found or not in ORDERED status. Please select a valid purchased batch.` },
    { status: 400 }
  )
}
```

## User Experience

### Before (Broken)
1. Click "New Weighing Record"
2. Enter vehicle plate, weights
3. ❌ System automatically picks first ORDERED batch
4. ❌ Can't choose which batch is arriving
5. ❌ If batch BTH-001 and BTH-002 both ordered, always gets BTH-001

### After (Fixed) ✅
1. Click "New Weighing Record"
2. **See dropdown of all purchased batches awaiting delivery**
3. Select specific batch (e.g., BTH-002 from Kaffa supplier)
4. See batch details (batch number, origin, status)
5. Enter vehicle plate, driver name, weights
6. Submit - weighing record linked to correct batch

## Complete Workflow Now

### 1. Purchasing Creates Order
- Creates batch with status `ORDERED`
- Batch appears in system awaiting delivery

### 2. Security Weighs Batch ✅ FIXED
- Opens "New Weighing Record" form
- **Dropdown shows all ORDERED batches**
- Selects specific batch being delivered
- Enters vehicle details and weights
- Batch status changes to `AT_GATE`

### 3. Warehouse Receives Batch
- Dropdown shows all `AT_GATE` batches
- Selects batch that was weighed
- Records storage location
- Batch status changes to `STORED`

### 4. Processing & Beyond
- Continue with normal workflow

## Benefits

✅ **Accurate tracking** - Correct batch linked to weighing record
✅ **Multiple deliveries** - Can handle multiple batches arriving same day
✅ **Visibility** - Security sees which batches are expected
✅ **Audit trail** - Clear record of which batch was weighed when
✅ **Error prevention** - Can't weigh same batch twice
✅ **Status enforcement** - Only ORDERED batches appear in dropdown

## Testing

### Test Scenario: Multiple Purchase Orders
```bash
1. Login as PURCHASING
2. Create purchase order #1: Kaffa supplier, 100kg
3. Create purchase order #2: Sidamo supplier, 150kg
4. Note: Both batches now have ORDERED status

5. Login as SECURITY
6. Click "New Weighing Record"
7. ✅ Dropdown shows BOTH batches:
   - BTH-xxx from Kaffa (100kg)
   - BTH-yyy from Sidamo (150kg)
8. Select Kaffa batch
9. Enter vehicle plate: ET-3-12345
10. Enter weights: Gross 2500kg, Tare 2400kg
11. Submit
12. ✅ Only Kaffa batch status changes to AT_GATE
13. ✅ Sidamo batch remains ORDERED

14. Later: Create another weighing record
15. ✅ Dropdown now shows only Sidamo batch (Kaffa already weighed)
16. Select Sidamo batch and weigh it
17. ✅ Both batches now at AT_GATE
```

## All Dropdown Filters Summary

| Stage | Component | Filter | Purpose |
|-------|-----------|--------|---------|
| **Security/Weighing** | `new-weighing-record-button` | `ORDERED` | Select which purchased batch is arriving |
| **Warehouse** | `receive-batch-button` | `AT_GATE` or `ORDERED` | Select batch weighed at gate |
| **Processing** | `new-processing-run-button` | `STORED` or `AT_WAREHOUSE` | Select batch stored in warehouse |
| **Quality** | `new-qc-check-button` | `STORED`, `AT_WAREHOUSE`, `PROCESSED`, `EXPORT_READY` | Select batch for inspection |

## Status Flow Diagram

```
ORDERED (Purchasing creates order)
   ↓
   [Security selects from dropdown & weighs]
   ↓
AT_GATE (Weighed at security checkpoint)
   ↓
   [Warehouse selects from dropdown & receives]
   ↓
STORED (In warehouse storage)
   ↓
   [Processing selects from dropdown & processes]
   ↓
PROCESSED (Ready for export)
   ↓
EXPORT_READY → IN_TRANSIT → SHIPPED
```

## Error Messages

### Before
- "No ORDERED batches available for weighing" (generic, unhelpful)

### After
- "Batch ID is required" (if no batch selected)
- "Batch not found or not in ORDERED status. Please select a valid purchased batch." (if invalid batch)
- Frontend: "Please select a batch" (if trying to submit without selection)

## Conclusion

The weighing process now correctly requires security personnel to explicitly select which purchased batch they are weighing. This ensures accurate tracking, supports multiple concurrent orders, and prevents errors from automatic batch assignment.

✅ **All batch selection dropdowns now working correctly across all workflow stages**
✅ **Complete traceability from purchase → weighing → warehouse → processing → export**
✅ **User-friendly interface with visual batch selection**
✅ **Status-based filtering ensures only appropriate batches appear**





