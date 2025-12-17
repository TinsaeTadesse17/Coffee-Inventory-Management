import { getBatchStatusColor, getAgingColor } from '@/lib/format-utils';
import { cn } from '@/lib/utils';

interface BatchStatusBadgeProps {
  status: string;
  isAging?: boolean;
  className?: string;
}

export function BatchStatusBadge({ status, isAging = false, className }: BatchStatusBadgeProps) {
  const statusColor = getBatchStatusColor(status);
  const agingColor = isAging ? getAgingColor(true) : null;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
          statusColor.bg,
          statusColor.text,
          statusColor.border,
          className
        )}
      >
        {statusColor.label}
      </span>
      {isAging && agingColor && (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border-2',
            agingColor.bg,
            agingColor.text,
            agingColor.border,
            'animate-pulse'
          )}
        >
          AGING (6+ months)
        </span>
      )}
    </div>
  );
}







