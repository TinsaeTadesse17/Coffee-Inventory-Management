"use client";

import { useState, useEffect } from 'react';
import { getBatchStatusColor, formatBatchNumber, getAgingColor } from '@/lib/format-utils';
import { cn } from '@/lib/utils';

interface Batch {
  id: string;
  batchNumber: string;
  status: string;
  isAging?: boolean;
  origin?: string;
  lastQcScore?: number;
}

interface BatchSelectorProps {
  value?: string;
  onChange: (batchId: string) => void;
  filter?: (batch: Batch) => boolean;
  className?: string;
}

export function BatchSelector({ value, onChange, filter, className }: BatchSelectorProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      const data = await response.json();
      setBatches(filter ? data.filter(filter) : data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find(b => b.id === value);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
          loading && 'opacity-50 cursor-not-allowed'
        )}
        disabled={loading}
      >
        {selectedBatch ? (
          <div className="flex items-center gap-2">
            <StatusDot status={selectedBatch.status} isAging={selectedBatch.isAging} />
            <span className="font-medium">{selectedBatch.batchNumber}</span>
            {selectedBatch.origin && (
              <span className="text-xs text-gray-500">({selectedBatch.origin})</span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">Select a batch...</span>
        )}
        <svg
          className={cn('h-5 w-5 text-gray-400 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            {batches.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No batches available</div>
            ) : (
              batches.map((batch) => {
                const statusColor = getBatchStatusColor(batch.status);
                const agingColor = batch.isAging ? getAgingColor(true) : null;

                return (
                  <button
                    key={batch.id}
                    type="button"
                    onClick={() => {
                      onChange(batch.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                      value === batch.id && 'bg-blue-50 border-l-4 border-blue-500'
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <StatusDot status={batch.status} isAging={batch.isAging} />
                      <span className={cn('font-medium', statusColor.text)}>{batch.batchNumber}</span>
                      {batch.origin && (
                        <span className="text-xs text-gray-500 truncate">({batch.origin})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          statusColor.bg,
                          statusColor.text,
                          statusColor.border,
                          'border'
                        )}
                        title={statusColor.label}
                      >
                        {statusColor.label}
                      </span>
                      {batch.isAging && agingColor && (
                        <span
                          className="text-red-600 font-bold text-sm"
                          title="Aging coffee (6+ months)"
                        >
                          🔴
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatusDot({ status, isAging }: { status: string; isAging?: boolean }) {
  const statusColor = getBatchStatusColor(status);

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <div
        className={cn(
          'h-3 w-3 rounded-full border-2',
          statusColor.bg,
          statusColor.border
        )}
        title={statusColor.label}
      />
      {isAging && (
        <span className="text-red-600 font-bold text-xs" title="Aging coffee (6+ months)">
          🔴
        </span>
      )}
    </div>
  );
}








