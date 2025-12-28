/**
 * Format a number with commas for better readability
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with commas
 */
export function formatNumber(num: number | string | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined || num === '') return '0';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency with commas
 * @param amount - Amount to format
 * @param currency - Currency code (ETB or USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null | undefined, currency: string = 'ETB'): string {
  if (amount === null || amount === undefined || amount === '') return `${currency} 0.00`;
  
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numValue)) return `${currency} 0.00`;
  
  return `${currency} ${formatNumber(numValue, 2)}`;
}

/**
 * Format weight in kilograms with commas
 * @param kg - Weight in kilograms
 * @returns Formatted weight string
 */
export function formatWeight(kg: number | string | null | undefined): string {
  if (kg === null || kg === undefined || kg === '') return '0 kg';
  
  const numValue = typeof kg === 'string' ? parseFloat(kg) : kg;
  if (isNaN(numValue)) return '0 kg';
  
  return `${formatNumber(numValue, 2)} kg`;
}

/**
 * Generate batch number with leading zeros
 * @param sequence - Sequential number
 * @returns Formatted batch number (e.g., "000", "001", "1,234")
 */
export function formatBatchNumber(sequence: number): string {
  if (sequence < 1000) {
    return sequence.toString().padStart(3, '0');
  }
  return formatNumber(sequence, 0);
}

/**
 * Get color class for batch status
 * @param status - Batch status
 * @returns Object with color classes and label
 */
export function getBatchStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  const statusColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    ORDERED: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      label: 'Pending Order',
    },
    AT_GATE: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      label: 'At Gate',
    },
    AT_WAREHOUSE: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      label: 'In Warehouse',
    },
    STORED: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      label: 'Stored',
    },
    PROCESSING_REQUESTED: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      label: 'Processing Requested',
    },
    IN_PROCESSING: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      label: 'In Processing',
    },
    PROCESSED: {
      bg: 'bg-teal-100',
      text: 'text-teal-800',
      border: 'border-teal-300',
      label: 'Processed',
    },
    EXPORT_READY: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      label: 'Export Ready',
    },
    IN_TRANSIT: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-800',
      border: 'border-cyan-300',
      label: 'In Transit',
    },
    SHIPPED: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      label: 'Shipped',
    },
    REJECTED: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      label: 'Rejected',
    },
    REPROCESSING: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      label: 'Reprocessing',
    },
  };

  return statusColors[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    label: status,
  };
}

/**
 * Get color for aging status
 * @param isAging - Whether coffee is aging (6+ months)
 * @returns Color classes
 */
export function getAgingColor(isAging: boolean): {
  bg: string;
  text: string;
  border: string;
} {
  if (isAging) {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-500',
    };
  }
  return {
    bg: '',
    text: '',
    border: '',
  };
}

/**
 * Calculate days in warehouse
 * @param entryDate - Date entered warehouse
 * @returns Number of days
 */
export function calculateDaysInWarehouse(entryDate: Date | string | null): number {
  if (!entryDate) return 0;
  const entry = new Date(entryDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - entry.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if coffee is aging (180+ days / 6 months)
 * @param entryDate - Date entered warehouse
 * @returns Boolean indicating if aging
 */
export function isAgingCoffee(entryDate: Date | string | null): boolean {
  const days = calculateDaysInWarehouse(entryDate);
  return days >= 180;
}

/**
 * Format jute bag size for display
 * @param size - JuteBagSize enum value
 * @returns Formatted string
 */
export function formatJuteBagSize(size: string): string {
  const sizeMap: Record<string, string> = {
    KG_30: '30kg',
    KG_50: '50kg',
    KG_60: '60kg',
    KG_85: '85kg (Reject)',
  };
  return sizeMap[size] || size;
}

/**
 * Convert measurement to kilograms
 * @param value - Quantity value
 * @param measurementType - Type of measurement
 * @param juteBagSize - Size of jute bag (if applicable)
 * @returns Weight in kilograms
 */
export function convertToKilograms(
  value: number,
  measurementType: string,
  juteBagSize?: string
): number {
  if (measurementType === 'KILOGRAM') {
    return value;
  } else if (measurementType === 'FERESULA') {
    return value * 17; // 17kg per Feresula
  } else if (measurementType === 'JUTE_BAG' && juteBagSize) {
    const sizeMap: Record<string, number> = {
      KG_30: 30,
      KG_50: 50,
      KG_60: 60,
      KG_85: 85,
    };
    return value * (sizeMap[juteBagSize] || 0);
  }
  return value;
}









