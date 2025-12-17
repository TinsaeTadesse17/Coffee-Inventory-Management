# Quality Check Input Validation

## Changes
- **Component**: `src/components/quality/new-qc-check-button.tsx`
- **Logic**: Updated `handleScoreChange` to intercept the input event.
- **Behavior**: 
    - If the user types a value > 10, the input is immediately set to 10.
    - If the user types a value < 0, the input is immediately set to 0.
    - This happens "while writing", preventing invalid values from being entered visually.

## Verification
- Open "New QC Check" dialog.
- Try to type "12" in any score field (e.g., Acidity).
- The input should automatically correct to "10".
