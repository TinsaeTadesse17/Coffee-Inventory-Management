# Processing Workflow Update

## Changes
- **Component**: `src/components/processing/new-processing-run-button.tsx`
- **API**: `src/app/api/processing/run/route.ts`
- **Logic**:
    - **Start Run**: Now only requires Batch ID, Input Weight, and Process Type.
    - **API**: Detects if output details are missing. If so, it creates a run with `IN_PROCESSING` status and does *not* record yields or bag usage yet.
    - **Batch Status**: Updates batch to `IN_PROCESSING`.

## Next Steps
- Need to implement a "Complete Run" button in the Processing Dashboard (`src/app/processing/page.tsx`) to allow users to input the final yields and bag usage for runs that are currently in progress.
