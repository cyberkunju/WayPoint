import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  ClipboardText,
  HourglassHigh,
  PlayCircle,
  CheckCircle,
  Archive,
  WarningCircle,
  Lightbulb,
} from '@phosphor-icons/react';

interface ProjectStatusBadgeProps {
  status: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG = {
  planning: {
    label: 'Planning',
    icon: Lightbulb,
    color: '#9B59B6',
    bgColor: 'rgba(155, 89, 182, 0.1)',
    description: 'Project is in planning phase',
  },
  in_progress: {
    label: 'In Progress',
    icon: PlayCircle,
    color: '#3498DB',
    bgColor: 'rgba(52, 152, 219, 0.1)',
    description: 'Project is actively being worked on',
  },
  on_hold: {
    label: 'On Hold',
    icon: HourglassHigh,
    color: '#F39C12',
    bgColor: 'rgba(243, 156, 18, 0.1)',
    description: 'Project is temporarily paused',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: '#27AE60',
    bgColor: 'rgba(39, 174, 96, 0.1)',
    description: 'Project has been completed',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    color: '#95A5A6',
    bgColor: 'rgba(149, 165, 166, 0.1)',
    description: 'Project is archived',
  },
  blocked: {
    label: 'Blocked',
    icon: WarningCircle,
    color: '#E74C3C',
    bgColor: 'rgba(231, 76, 60, 0.1)',
    description: 'Project is blocked by dependencies',
  },
  active: {
    label: 'Active',
    icon: ClipboardText,
    color: '#2E5AAC',
    bgColor: 'rgba(46, 90, 172, 0.1)',
    description: 'Project is active',
  },
} as const;

export function ProjectStatusBadge({
  status,
  showLabel = true,
  size = 'md',
}: ProjectStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  const Icon = config.icon;

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;
  const badgeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  const badge = (
    <Badge
      variant="outline"
      className={`gap-1.5 ${badgeClass}`}
      style={{
        borderColor: config.color,
        backgroundColor: config.bgColor,
        color: config.color,
      }}
    >
      <Icon size={iconSize} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
