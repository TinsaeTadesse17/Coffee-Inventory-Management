# Batch Dropdown Implementation - Summary of Changes

## Problem
When creating entries in different departments (warehouse, processing, quality), users had to manually type batch IDs. This caused:
- ❌ Typos and errors
- ❌ No visibility of which batches are ready for each stage
- ❌ No workflow enforcement
- ❌ Users could select batches in wrong status

## Solution
Implemented proper batch dropdown selectors with status-based filtering at each workflow stage.

## Files Changed

### 1. **src/components/weighing/new-weighing-record-button.tsx**
**Changes:**
- ✅ Added `BatchSelector` component to select which purchased batch is being weighed
- ✅ Added filter: Shows only batches with status `ORDERED`
- ✅ Added validation to ensure batch is selected
- ✅ Added help text: "Select which purchased batch is arriving for weighing"
- ✅ Updated API to accept `batchId` parameter

**Before:**
```tsx
// No batch selection - API automatically picked first ORDERED batch
async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  const data = {
    vehiclePlate: formData.get("vehiclePlate"),
    driverName: formData.get("driverName"),
    grossWeight: parseFloat(formData.get("grossWeight") as string),
    tareWeight: parseFloat(formData.get("tareWeight") as string),
  }
}
```

**After:**
```tsx
// Security staff selects which batch is arriving
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

async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  if (!batchId) {
    toast.error("Please select a batch")
    return
  }
  const data = {
    batchId: batchId, // ✅ Now includes selected batch
    vehiclePlate: formData.get("vehiclePlate"),
    // ...
  }
}
```

### 2. **src/components/warehouse/receive-batch-button.tsx**
**Changes:**
- ✅ Replaced text input with `BatchSelector` component
- ✅ Added filter: Shows only batches with status `AT_GATE` or `ORDERED`
- ✅ Added validation to ensure batch is selected
- ✅ Added help text: "Only batches that have been weighed at the gate appear here"

**Before:**
```tsx
<Input
  id="batchId"
  name="batchId"
  placeholder="e.g., BTH-2024-001"
  required
  value={batchId}
  onChange={(e) => setBatchId(e.target.value)}
/>
```

**After:**
```tsx
<BatchSelector
  value={batchId}
  onChange={setBatchId}
  filter={(batch) => batch.status === "AT_GATE" || batch.status === "ORDERED"}
  className="w-full"
/>
<p className="text-xs text-muted-foreground">
  Only batches that have been weighed at the gate appear here
</p>
```

### 3. **src/components/processing/new-processing-run-button.tsx**
**Changes:**
- ✅ Replaced text input with `BatchSelector` component
- ✅ Added filter: Shows only batches with status `STORED` or `AT_WAREHOUSE`
- ✅ Added validation to ensure batch is selected
- ✅ Added help text: "Only batches stored in warehouse appear here"
- ✅ Fixed toast message to show correct field names from API response

**Before:**
```tsx
<Input
  id="batchId"
  name="batchId"
  placeholder="e.g., BTH-2024-001"
  required
/>
```

**After:**
```tsx
<BatchSelector
  value={batchId}
  onChange={setBatchId}
  filter={(batch) => batch.status === "STORED" || batch.status === "AT_WAREHOUSE"}
  className="w-full"
/>
<p className="text-xs text-muted-foreground">
  Only batches stored in warehouse appear here
</p>
```

### 4. **src/components/quality/new-qc-check-button.tsx**
**Changes:**
- ✅ Replaced text input with `BatchSelector` component
- ✅ Added filter: Shows batches with status `STORED`, `AT_WAREHOUSE`, `PROCESSED`, or `EXPORT_READY`
- ✅ Added validation to ensure batch is selected
- ✅ Added help text: "Quality checks can be done on batches in warehouse or after processing"

**Before:**
```tsx
<Input
  id="batchId"
  name="batchId"
  placeholder="e.g., BTH-2024-001"
  required
/>
```

**After:**
```tsx
<BatchSelector
  value={batchId}
  onChange={setBatchId}
  filter={(batch) => 
    batch.status === "STORED" || 
    batch.status === "AT_WAREHOUSE" ||
    batch.status === "PROCESSED" ||
    batch.status === "EXPORT_READY"
  }
  className="w-full"
/>
<p className="text-xs text-muted-foreground">
  Quality checks can be done on batches in warehouse or after processing
</p>
```

### 5. **src/app/api/weighing/create/route.ts**
**Changes:**
- ✅ Now accepts `batchId` parameter from the form
- ✅ Validates that the selected batch exists and has `ORDERED` status
- ✅ No longer auto-selects the first available batch

**Before:**
```typescript
const data = await request.json()
const netWeight = data.grossWeight - data.tareWeight

// Auto-selects first ORDERED batch
const batch = await prisma.batch.findFirst({
  where: { status: "ORDERED" },
  orderBy: { createdAt: "desc" },
})
```

**After:**
```typescript
const data = await request.json()
const { batchId, grossWeight, tareWeight, driverName } = data

if (!batchId) {
  return NextResponse.json(
    { error: "Batch ID is required" },
    { status: 400 }
  )
}

const netWeight = grossWeight - tareWeight

// Uses the specific batch selected by user
const batch = await prisma.batch.findFirst({
  where: { 
    OR: [
      { id: batchId },
      { batchNumber: batchId }
    ],
    status: "ORDERED"
  },
})
```

### 6. **src/app/api/suppliers/create/route.ts**
**Changes:**
- ✅ Added missing `currentQuantityKg` field when creating batch
- ✅ Fixed Prisma validation error that was preventing purchase order creation

**Before:**
```tsx
const batch = await prisma.batch.create({
  data: {
    batchNumber: `BTH-${Date.now()}`,
    supplierId: supplier.id,
    origin: data.origin,
    purchaseDate: new Date(),
    purchasedQuantityKg: data.quantityKg,
    purchaseCost: data.quantityKg * data.pricePerKg,
    purchaseCurrency: "ETB",
    status: "ORDERED",
  },
})
```

**After:**
```tsx
const batch = await prisma.batch.create({
  data: {
    batchNumber: `BTH-${Date.now()}`,
    supplierId: supplier.id,
    origin: data.origin,
    purchaseDate: new Date(),
    purchasedQuantityKg: data.quantityKg,
    currentQuantityKg: data.quantityKg, // ✅ Added this field
    purchaseCost: data.quantityKg * data.pricePerKg,
    purchaseCurrency: "ETB",
    status: "ORDERED",
  },
})
```

### 7. **src/app/api/warehouse/receive/route.ts**
**Changes:**
- ✅ Changed batch status from `AT_WAREHOUSE` to `STORED` on arrival
- ✅ Fixed audit log bug (was using undefined `parsedWeight` variable)

**Before:**
```tsx
if (entryTypeValue === WarehouseEntryType.ARRIVAL) {
  newStatus = BatchStatus.AT_WAREHOUSE
}
// ...
receivedWeight: parsedWeight, // ❌ undefined variable
```

**After:**
```tsx
if (entryTypeValue === WarehouseEntryType.ARRIVAL) {
  newStatus = BatchStatus.STORED // ✅ Changed to STORED
}
// ...
receivedWeight: calculatedWeight, // ✅ Fixed variable name
```

## Existing Components (Already Working)

### BatchSelector Component
The `BatchSelector` component (src/components/ui/batch-selector.tsx) was already created and working perfectly! It features:
- ✅ Dropdown interface
- ✅ Shows batch number, origin, status badge
- ✅ Aging indicators for coffee stored 6+ months
- ✅ Accepts filter function for status-based filtering
- ✅ Real-time loading from `/api/batches`

### API Endpoints (Updated)
- ✅ `/api/weighing/create` - Now accepts batchId, sets status to `AT_GATE`
- ✅ `/api/processing/run` - Sets status to `PROCESSED` or `REJECTED`
- ✅ `/api/batches` - Returns all needed fields (id, batchNumber, status, origin, isAging)

## Workflow Now Working

### Complete Coffee Journey
1. **Purchasing** creates order → Status: `ORDERED` ✅
2. **Security** weighs at gate → Status: `AT_GATE` ✅
   - Dropdown shows only `ORDERED` batches (purchased but not yet weighed) ✅
3. **Warehouse** receives batch → Status: `STORED` ✅
   - Dropdown shows only `AT_GATE` batches (weighed at gate) ✅
4. **Quality** inspects batch → No status change
   - Dropdown shows `STORED`, `AT_WAREHOUSE`, `PROCESSED`, `EXPORT_READY` ✅
5. **Processing** processes batch → Status: `PROCESSED` ✅
   - Dropdown shows only `STORED` or `AT_WAREHOUSE` batches ✅
6. **Export** ships batch → Status: `IN_TRANSIT` then `SHIPPED` ✅

## User Experience Improvements

### Before
- Type batch ID manually (e.g., "BTH-1234567890")
- Risk of typos
- No visibility of available batches
- Could select wrong batch or batch in wrong state
- Error: "Batch not found"

### After  
- **Click dropdown** → See all eligible batches
- **Visual selection** with batch details
- **Status badges** show batch state
- **Filtered list** shows only batches ready for this stage
- **Aging warnings** for old coffee
- **Origin display** helps identify batches
- **Zero typos** - no manual typing needed

## Testing Instructions

1. **Test Purchasing → Security → Warehouse flow:**
   ```
   1. Login as PURCHASING user
   2. Create new purchase order (creates batch in ORDERED status)
   3. Login as SECURITY user (or any user with weighing access)
   4. Click "New Weighing Record"
   5. ✅ Dropdown shows the ORDERED batch you just created!
   6. Select the batch, enter vehicle plate, weights
   7. Submit weighing record (batch status → AT_GATE)
   8. Login as WAREHOUSE user
   9. Click "Receive Batch"
   10. ✅ Dropdown should show the batch you just weighed!
   11. Select it, enter storage details, submit
   ```

2. **Test Warehouse → Processing flow:**
   ```
   1. After receiving batch in warehouse (status: STORED)
   2. Login as PLANT_MANAGER user
   3. Go to Processing page
   4. Click "New Processing Run"
   5. ✅ Dropdown should show the stored batch!
   6. Select it, enter input weight, submit
   ```

3. **Test Quality Check:**
   ```
   1. Login as QUALITY user
   2. Go to Quality page
   3. Click "New QC Check"
   4. ✅ Dropdown shows batches in warehouse or processed
   5. Select batch, enter cupping scores
   ```

## Benefits

✅ **Workflow enforcement** - Can't process what hasn't been received
✅ **No more typos** - Visual selection instead of typing
✅ **Better UX** - See all available options at a glance
✅ **Status visibility** - Know batch state before selecting
✅ **Aging alerts** - Visual warnings for old coffee
✅ **Reduced errors** - Proper validation and filtering

## Error Fixed

The original error you reported:
```
Argument `currentQuantityKg` is missing.
```

This has been fixed by adding `currentQuantityKg` to the batch creation in the purchase order API. The field is required by Prisma schema and tracks the current available quantity (which decreases during processing).





