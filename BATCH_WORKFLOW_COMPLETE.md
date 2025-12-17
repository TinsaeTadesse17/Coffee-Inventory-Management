# Coffee Batch Workflow - Complete Implementation

## Overview
The coffee batch tracking system now has a complete workflow with proper status transitions and batch selection dropdowns at each stage.

## Workflow Stages

### 1. **Purchasing** → Creates Batch (Status: `ORDERED`)
- **Action**: Purchasing department creates a new purchase order
- **Component**: `new-purchase-order-button.tsx`
- **API**: `/api/suppliers/create`
- **Status Set**: `ORDERED`
- **Fields Set**: 
  - `purchasedQuantityKg`: Initial quantity purchased
  - `currentQuantityKg`: Same as purchased quantity initially
  - Batch number, supplier info, origin, cost, etc.

### 2. **Security** → Weighs Batch (Status: `AT_GATE`)
- **Action**: Security weighs the delivery vehicle at the gate
- **Component**: `new-weighing-record-button.tsx`
- **API**: `/api/weighing/create`
- **Dropdown Filter**: Shows batches with status `ORDERED`
- **Status Set**: `AT_GATE`
- **Records**: 
  - Selected batch (from dropdown of purchased batches)
  - Vehicle plate, gross weight, tare weight, net weight
  - Driver name (optional)

### 3. **Warehouse** → Receives Batch (Status: `STORED`)
- **Action**: Warehouse receives and stores the batch
- **Component**: `receive-batch-button.tsx` 
- **API**: `/api/warehouse/receive`
- **Dropdown Filter**: Shows batches with status `AT_GATE` or `ORDERED`
- **Status Set**: `STORED` (for ARRIVAL type)
- **Records**: Storage locations, received weight, bags, moisture, temperature
- **Features**:
  - Shows weighing record if available
  - Validates weight against gate weighing
  - Alerts on weight mismatches

### 4. **Quality** → Inspects Batch
- **Action**: Quality team performs cupping/inspection
- **Component**: `new-qc-check-button.tsx`
- **API**: `/api/quality/check`
- **Dropdown Filter**: Shows batches with status `STORED`, `AT_WAREHOUSE`, `PROCESSED`, or `EXPORT_READY`
- **Records**: Cupping scores, tasting notes, total score
- **Note**: Can QC at multiple stages (initial, post-processing, pre-export)

### 5. **Processing** → Processes Batch (Status: `PROCESSED`)
- **Action**: Plant manager processes the coffee
- **Component**: `new-processing-run-button.tsx`
- **API**: `/api/processing/run`
- **Dropdown Filter**: Shows batches with status `STORED` or `AT_WAREHOUSE`
- **Status Set**: `PROCESSED` (for export) or `REJECTED`
- **Updates**:
  - Deducts input quantity from `currentQuantityKg`
  - Records export quantity, reject quantity, waste, yield ratio
  - Creates processing run with costs

### 6. **Export** → Creates Contract & Ships
- **Action**: Export manager creates contract and arranges shipment
- **Component**: `new-contract-button.tsx`
- **API**: `/api/contracts/create`
- **Filter**: Should show batches with status `PROCESSED` or `EXPORT_READY`
- **Note**: Contracts don't directly update batch status; shipment does

## Key Features Implemented

### ✅ Batch Selector Dropdown
- **Component**: `batch-selector.tsx`
- **Features**:
  - Visual dropdown with batch numbers
  - Shows batch status badge (color-coded)
  - Shows origin
  - Shows aging indicator (6+ months warning)
  - Filters batches by status based on workflow stage
  - Real-time loading from API

### ✅ Status-Based Filtering
Each role only sees batches that are ready for their stage:
- **Security/Weighing**: `ORDERED` batches (purchased but not yet weighed)
- **Warehouse**: `AT_GATE` or `ORDERED` batches (weighed at gate)
- **Processing**: `STORED` or `AT_WAREHOUSE` batches (in warehouse)
- **Quality**: `STORED`, `AT_WAREHOUSE`, `PROCESSED`, `EXPORT_READY` batches (anywhere from warehouse to export)

### ✅ Automatic Status Updates
- Purchase order → `ORDERED`
- Weighing at gate → `AT_GATE`
- Warehouse arrival → `STORED`
- Processing export → `PROCESSED`
- Processing reject → `REJECTED`

### ✅ Quantity Tracking
- `purchasedQuantityKg`: Original purchase quantity (never changes)
- `currentQuantityKg`: Current available quantity (decreases with processing)
- Processing deducts from current quantity
- Multiple processing runs possible until quantity depleted

## Batch Status Values
From `prisma/schema.prisma`:
```
enum BatchStatus {
  ORDERED              // Created by purchasing
  AT_GATE              // Weighed at security gate
  AT_WAREHOUSE         // (deprecated, use STORED)
  STORED               // Received and stored in warehouse
  PROCESSING_REQUESTED // (future use)
  IN_PROCESSING        // (future use - during processing)
  PROCESSED            // Processing complete
  EXPORT_READY         // Ready for export
  IN_TRANSIT           // Shipped
  SHIPPED              // Delivered
  REJECTED             // Failed QC or rejected during processing
  REPROCESSING         // Being reprocessed
}
```

## API Endpoints Updated

1. **`/api/suppliers/create`**
   - Added `currentQuantityKg` field (was missing, causing errors)
   - Sets initial status to `ORDERED`

2. **`/api/weighing/create`**
   - Updates batch status to `AT_GATE`
   - Already working correctly

3. **`/api/warehouse/receive`**
   - Changed status from `AT_WAREHOUSE` to `STORED`
   - Fixed audit log bug (was using undefined `parsedWeight`)

4. **`/api/processing/run`**
   - Sets status to `PROCESSED` or `REJECTED`
   - Deducts from `currentQuantityKg`
   - Already working correctly

## Testing the Flow

1. **Create Purchase Order** (Purchasing role)
   - Go to Purchasing page
   - Click "New Purchase Order"
   - Fill in supplier, origin, quantity, price
   - Batch is created with status `ORDERED`

2. **Weigh at Gate** (Security role)
   - Go to Security page (if exists) or use weighing component
   - Click "New Weighing Record"
   - **Select batch from dropdown** (shows only ORDERED batches)
   - Enter vehicle plate, driver name, gross weight, tare weight
   - Batch status changes to `AT_GATE`

3. **Receive in Warehouse** (Warehouse role)
   - Go to Warehouse page
   - Click "Receive Batch"
   - **Dropdown now shows only batches at gate!**
   - Select batch from dropdown
   - Enter storage locations, received weight, bags
   - Batch status changes to `STORED`

4. **Quality Check** (Quality role)
   - Go to Quality page
   - Click "New QC Check"
   - **Dropdown shows stored batches**
   - Select batch and enter cupping scores
   - Batch ready for processing

5. **Process Batch** (Processing role)
   - Go to Processing page
   - Click "New Processing Run"
   - **Dropdown shows only stored batches!**
   - Select batch, enter input weight and process type
   - Batch status changes to `PROCESSED`

## Benefits

✅ **No more manual typing** of batch IDs
✅ **No errors** from typos in batch numbers
✅ **Proper workflow enforcement** - can't process a batch that hasn't been received
✅ **Clear visibility** of which batches are ready for each stage
✅ **Status indicators** show batch state at a glance
✅ **Aging warnings** for coffee stored 6+ months

## Next Steps (Optional Enhancements)

- Add contract-to-batch linking for export
- Add shipment tracking with status updates
- Add batch splitting functionality
- Add batch merging for processing multiple origins
- Add automated notifications when batches reach next stage



