# Processing Workflow Overhaul - Complete

## Overview
The processing workflow has been completely overhauled to support real-world manufacturing scenarios:
1.  **Multi-Batch Processing**: You can now mix multiple batches (e.g., blending different lots) into a single processing run.
2.  **Partial Processing**: You can process a specific weight from a batch, leaving the rest in "STORED" status.
3.  **Two-Stage Workflow**:
    -   **Start Run**: Select inputs and deduct inventory immediately. No output results required yet.
    -   **Complete Run**: Enter final yields (Export/Reject weights) and bag usage when the job is done.

## Changes Implemented

### Database Schema
-   Added `ProcessingRunInput` model to handle many-to-many relationship between `ProcessingRun` and `Batch` with specific `weightUsed`.
-   Added `status` field (`IN_PROGRESS`, `COMPLETED`) to `ProcessingRun`.

### API
-   **POST /api/processing/run**: Updated to handle "Start Run" logic.
    -   Accepts `inputs` array (batchId + weight).
    -   Deducts weight from batches immediately.
    -   Keeps batches as `STORED` if they still have quantity.
-   **POST /api/processing/run/[id]/complete**: New endpoint for "Complete Run" logic.
    -   Calculates total input from stored inputs.
    -   Records Export/Reject quantities.
    -   Calculates Yield %.
    -   Updates Inventory (Jute Bags).
    -   Marks run as `COMPLETED`.

### Frontend
-   **NewProcessingRunButton**:
    -   Updated to support adding multiple batches dynamically.
    -   Removed output fields (Export/Reject/Bag Size) from the start form.
-   **CompleteProcessingRunButton**:
    -   New component to handle the completion phase.
    -   Added to the Processing Dashboard table for runs that are "In Progress".

## How to Use
1.  Go to **Processing**.
2.  Click **New Processing Run**.
3.  Add one or more batches and specify the weight to use from each.
4.  Click **Start Processing**. The run will appear in the table as "In Progress" (no yield/output data yet).
5.  When physical processing is done, click the **Complete** button in the "Actions" column.
6.  Enter the final **Export Weight**, **Reject Weight**, and **Bag Size**.
7.  Click **Complete Run**. The system will calculate yield and update stock.
