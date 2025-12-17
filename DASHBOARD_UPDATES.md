# Dashboard Updates

## Processing Page (`src/app/processing/page.tsx`)
- Updated the "Batches" column to "Input Batches".
- Now displays the readable `runNumber` (e.g., RUN-123-456).
- Now displays the readable `batchNumber` (e.g., BTH-123-456) for each input batch.
- Added supplier or third-party entity name next to the batch number for better context.

## Plant Manager Dashboard (`src/components/dashboard/role-dashboards.tsx`)
- Updated the "Recent Processing Runs" widget.
- Replaced the generic processing type display with the specific `runNumber`.
- Added a list of input `batchNumber`s to the entry.
- Retained the date and yield information.

## Backend ID Generation (Previously Completed)
- `src/lib/utils.ts`: Added `generateId` function.
- `src/app/api/suppliers/create/route.ts`: Uses `generateId("BTH")` for new batches.
- `src/app/api/processing/run/route.ts`: Uses `generateId("RUN")` for new processing runs.
