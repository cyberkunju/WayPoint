import { Tag, X } from '@phosphor-icons/react';
import { type Label } from '@/services/labels.service';

interface LabelBadgeProps {
  label: Label;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function LabelBadge({
  label,
  size = 'md',
  showIcon = true,
  onRemove,
  className = '',
}: LabelBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${label.color}20`,
        color: label.color,
      }}
    >
      {showIcon && <Tag size={iconSizes[size]} />}
      <span className="truncate">{label.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label.name} label`}
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </span>
  );
}

interface LabelBadgeListProps {
  labels: Label[];
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  maxDisplay?: number;
  onRemove?: (labelId: string) => void;
  className?: string;
}

export function LabelBadgeList({
  labels,
  size = 'md',
  showIcon = true,
  maxDisplay,
  onRemove,
  className = '',
}: LabelBadgeListProps) {
  const displayLabels = maxDisplay ? labels.slice(0, maxDisplay) : labels;
  const remainingCount = maxDisplay && labels.length > maxDisplay ? labels.length - maxDisplay : 0;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  if (labels.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayLabels.map((label) => (
        <LabelBadge
          key={label.$id}
          label={label}
          size={size}
          showIcon={showIcon}
          onRemove={onRemove ? () => onRemove(label.$id) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-muted text-muted-foreground ${sizeClasses[size]}`}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
