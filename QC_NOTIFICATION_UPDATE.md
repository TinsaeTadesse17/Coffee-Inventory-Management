# Notification Update: QC to Plant Manager

## Change
Updated the notification logic in `src/app/api/quality/check/route.ts`.

## Previous Logic
The system only notified the Plant Manager if:
1.  The batch passed QC.
2.  AND it was the **very first** QC check record for that batch (`existingQcCount === 0`).

## New Logic
The system now notifies the Plant Manager if:
1.  The batch passes QC.
2.  AND the check type is **"FIRST_QC"** (the standard check upon arrival).

## Benefit
This ensures that if a batch initially fails (or has a data entry error) and is later re-checked and passes the "First QC" standard, the Plant Manager will correctly receive the "Ready for Processing" notification.
