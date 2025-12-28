# Fix: Batch Creation Errors

## Issue
The user reported a `PrismaClientValidationError` when creating a purchase order:
`Unknown argument supplier. Did you mean supplierId?`
And also `NaN` values for quantity and cost.

## Root Cause
1.  **NaN Values**: The `quantity` and `pricePerKg` from the request body were not being validated, leading to `NaN` when converted to Number if the input was invalid.
2.  **Prisma Argument Error**: The `prisma.batch.create` call was using `supplier: { connect: ... }` which failed validation, suggesting `supplierId` should be used instead. This likely indicates the Prisma Client is expecting scalar fields for this operation.

## Fixes Applied
1.  **Validation**: Added checks for `quantity` and `pricePerKg` in `src/app/api/suppliers/create/route.ts` and `src/app/api/batches/create-third-party/route.ts`.
2.  **Relation Syntax**: Switched from `supplier: { connect: { id: ... } }` to `supplierId: ...` (and similarly for `thirdPartyEntityId`) in both files.

## Files Modified
- `src/app/api/suppliers/create/route.ts`
- `src/app/api/batches/create-third-party/route.ts`

## Verification
- Code now validates input before database call.
- Code uses the suggested `supplierId` argument.
