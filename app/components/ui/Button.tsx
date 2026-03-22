import { cn } from '@/app/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?:     'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-500',
  secondary: 'bg-white/10 text-white hover:bg-white/15',
  outline:   'border border-white/15 text-white/70 hover:border-white/30 hover:text-white',
  ghost:     'text-white/50 hover:text-white hover:bg-white/8',
  danger:    'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25',
  gold:      'text-ink font-bold hover:opacity-90',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, disabled, style, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      style={variant === 'gold' ? { background: 'var(--gold)', ...style } : style}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <span
          className="rounded-full border-2 border-current border-t-transparent animate-spin"
          style={{ width: size === 'sm' ? 12 : 14, height: size === 'sm' ? 12 : 14 }}
        />
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';