# Quality Dashboard Update

## Changes
- **Component**: `src/components/dashboard/role-dashboards.tsx`
- **Feature**: Updated the Quality Dashboard to display QC statistics.
- **Details**:
    - Replaced "Exceptional Lots" card with "QC Status".
    - Shows the count of **Passed** batches (Score >= 80).
    - Shows the count of **Rejected** batches (Score < 80).
    - Format: "Passed / Rejected" (e.g., "15 / 2").

## Verification
- Log in as Quality Manager or Admin.
- View the dashboard.
- The middle card in the top row should now show "QC Status" with the correct counts.
