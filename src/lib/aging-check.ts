import { prisma } from './prisma';
import { calculateDaysInWarehouse, isAgingCoffee } from './format-utils';
import { notifyAgingCoffee } from './notification-service';

/**
 * Check all batches in warehouse for aging (6+ months)
 * This should be run periodically (e.g., daily via cron job)
 */
export async function checkAgingCoffee() {
  try {
    // Get all batches currently in warehouse
    const warehouseBatches = await prisma.batch.findMany({
      where: {
        status: {
          in: ['AT_WAREHOUSE', 'STORED'],
        },
        warehouseEntryDate: {
          not: null,
        },
      },
      select: {
        id: true,
        batchNumber: true,
        warehouseEntryDate: true,
        isAging: true,
      },
    });

    const agingBatches: Array<{ id: string; batchNumber: string; daysInWarehouse: number }> = [];

    for (const batch of warehouseBatches) {
      if (!batch.warehouseEntryDate) continue;

      const daysInWarehouse = calculateDaysInWarehouse(batch.warehouseEntryDate);
      const shouldBeAging = isAgingCoffee(batch.warehouseEntryDate);

      // If batch should be marked as aging but isn't yet
      if (shouldBeAging && !batch.isAging) {
        // Update batch to mark as aging
        await prisma.batch.update({
          where: { id: batch.id },
          data: { isAging: true },
        });

        agingBatches.push({
          id: batch.id,
          batchNumber: batch.batchNumber,
          daysInWarehouse,
        });

        // Send notification
        await notifyAgingCoffee({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          daysInWarehouse,
        });
      }
    }

    return {
      success: true,
      checkedCount: warehouseBatches.length,
      agingBatchesFound: agingBatches.length,
      agingBatches,
    };
  } catch (error) {
    console.error('Error checking aging coffee:', error);
    throw error;
  }
}

/**
 * Get summary of aging coffee
 */
export async function getAgingSummary() {
  const agingBatches = await prisma.batch.findMany({
    where: {
      isAging: true,
      status: {
        in: ['AT_WAREHOUSE', 'STORED'],
      },
    },
    select: {
      id: true,
      batchNumber: true,
      origin: true,
      warehouseEntryDate: true,
      currentQuantityKg: true,
      purchasedQuantityKg: true,
    },
  });

  return agingBatches.map(batch => ({
    ...batch,
    daysInWarehouse: batch.warehouseEntryDate 
      ? calculateDaysInWarehouse(batch.warehouseEntryDate)
      : 0,
  }));
}










