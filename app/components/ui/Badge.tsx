import { cn } from '@/app/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'solid';
  color?: string;
  className?: string;
}

export function Badge({ children, variant = 'outline', color, className }: BadgeProps) {
  if (variant === 'solid' && color) {
    return (
      <span
        className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white', className)}
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    );
  }

  if (variant === 'outline' && color) {
    return (
      <span
        className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', className)}
        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        'bg-white/10 text-white/60',
        className
      )}
    >
      {children}
    </span>
  );
}