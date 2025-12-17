# ID Generation and Formatting Updates

## ID Generation
All ID generation has been standardized to use the `generateId` utility function, which produces IDs in the format `PREFIX-000-000` (e.g., `BTH-123-456`).

- **Batches**: `BTH-XXX-XXX` (Verified in `src/app/api/suppliers/create/route.ts`)
- **Processing Runs**: `RUN-XXX-XXX` (Verified in `src/app/api/processing/run/route.ts`)
- **Warehouse Entries**: `WH-XXX-XXX` (Updated in `src/app/api/warehouse/receive/route.ts`)
- **Contracts**: `CNT-XXX-XXX` (Updated in `src/app/api/contracts/create/route.ts`)

## Dashboard Formatting
The `ProcessingPage` (`src/app/processing/page.tsx`) has been updated to use the formatting utilities:
- `formatNumber` for percentages and counts.
- `formatWeight` for weight values (kg).

This ensures consistent display of numbers with commas and appropriate decimal places across the application.

## Next Steps
- Restart the server to apply the API changes.
- Verify that new entries (Batches, Runs, Warehouse Entries, Contracts) are created with the correct ID format.
