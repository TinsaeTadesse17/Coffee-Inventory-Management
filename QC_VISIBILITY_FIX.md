# Fix: QC Passed Batches Visibility

## Problem
The user reported that batches passing QC were not showing up in the Plant Manager's dashboard for processing.

## Root Cause
1.  **Dashboard Count**: The `PlantManagerDashboard` was filtering batches by `status === "QC_PASSED"`. This status does not exist in the `BatchStatus` enum. The correct status after QC is `STORED`.
2.  **Processing Selection**: The `NewProcessingRunButton` was filtering for `STORED` or `AT_WAREHOUSE` but did not check for QC results. While this technically allowed selection, it didn't enforce the business rule that processing requires a passed QC check.

## Changes
1.  **`src/components/dashboard/role-dashboards.tsx`**:
    - Updated `PlantManagerDashboard` to calculate `readyForProcessing` by filtering for batches that are `STORED` AND have a corresponding `QualityCheck` with `totalScore >= 80`.

2.  **`src/app/api/batches/route.ts`**:
    - Updated the API to include `lastQcScore` (derived from the most recent `QualityCheck`) in the response.

3.  **`src/components/ui/batch-selector.tsx`**:
    - Updated `Batch` interface to include `lastQcScore`.

4.  **`src/components/processing/new-processing-run-button.tsx`**:
    - Updated the `BatchSelector` filter to only show batches that are `STORED` AND have `lastQcScore >= 80`.

## Verification
- **Dashboard**: The "Ready for Processing" card should now show the correct count of batches that have passed QC.
- **New Run Dialog**: The batch selector will now only list batches that have explicitly passed QC, preventing accidental processing of unverified or rejected coffee.
