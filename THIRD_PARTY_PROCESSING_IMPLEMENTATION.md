# Third Party Processing Implementation

## Overview
Implemented a complete workflow for handling "Third Party" coffee processing, including batch creation, queue management, cost tracking, and financial reporting.

## Features Implemented

### 1. Third Party Batch Creation
- **New API Endpoint**: `api/batches/create-third-party`
  - Creates batches with `isThirdParty: true`.
  - Links to `ThirdPartyEntity` (auto-created if not exists).
  - Generates IDs with `EXT-` prefix.
  - Sets `queuePosition` automatically.
- **UI Component**: `NewThirdPartyBatchButton`
  - Added to `Purchasing` page (renamed to "Purchasing & Sourcing").
  - Allows registering incoming coffee from external entities.

### 2. Processing Queue Management
- **New Page**: `/processing/queue`
  - Lists batches ready for processing (`STORED` status).
  - Separates "Internal Batches" (Priority) and "Third Party Batches".
  - Shows arrival time and quantity.
  - "Process" button links directly to the processing run form.
- **Navigation**: Added "View Queue" button to the main Processing dashboard.

### 3. Processing Run & Cost Tracking
- **Updated API**: `api/processing/run`
  - Now accepts `processingCosts` and `storageCosts` arrays.
  - Creates `ProcessingCost` and `StorageCost` records in the database.
- **Updated UI**: `NewProcessingRunButton`
  - Automatically detects if a selected batch is Third Party.
  - **Dynamic Cost Calculation**:
    - **Storage Cost**: Calculates billable days (Days in warehouse - 15 free days) * Bags * Rate.
    - **Processing Cost**: Calculates based on weight * Rate per ton.
  - **Cost Inputs**:
    - Allows editing default rates (Storage: 5 ETB/bag/day, Processing: 2200 ETB/ton).
    - Allows adding "Additional Costs" (Moving Cost, Weighing Fee, etc.) via a dynamic list.

### 4. Financial Reporting
- **Updated Finance Dashboard**: `src/app/finance/page.tsx`
  - Added "Service Revenue" card.
  - Calculates total revenue from Processing Fees and Storage Fees.
  - Displays value in ETB and USD.
  - Added Service Revenue to "Total Receivables" calculation.

## Workflow
1. **Receive**: Go to Purchasing -> "Receive Third Party Coffee". Enter details.
2. **Queue**: Go to Processing -> "View Queue". See the batch listed.
3. **Process**: Click "Process" or "New Processing Run". Select the batch.
4. **Costs**: The system auto-calculates Storage and Processing fees. Add any "Moving Costs".
5. **Report**: Go to Finance. See the revenue under "Service Revenue".
