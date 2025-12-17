# ID Generation Fix

## Status
- **Batch IDs**: Configured to use `BTH-XXX-XXX` format (e.g., `BTH-123-456`).
- **Run IDs**: Configured to use `RUN-XXX-XXX` format (e.g., `RUN-987-654`).

## Implementation Details
- **Utility**: `src/lib/utils.ts` contains the `generateId(prefix)` function which generates a 6-digit random number and formats it as `000-000`.
- **Batches**: `src/app/api/suppliers/create/route.ts` uses `generateId("BTH")` when creating new batches from purchase orders.
- **Processing Runs**: `src/app/api/processing/run/route.ts` uses `generateId("RUN")` when creating new processing runs.

## Bug Fix
- Fixed a critical bug in `src/app/api/processing/run/route.ts` where the code attempted to use the `processingRun.id` before the run was actually created. This would have caused processing runs to fail, potentially leading to the user believing the feature wasn't working.
- Reordered the logic to ensure `processingRun` is created first, then costs are recorded using its ID.
