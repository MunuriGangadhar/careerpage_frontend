import { cn } from '@/app/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

// ─── Text Input ────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  dark?:    boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, dark = false, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          dark ? 'input-base' : 'input-light',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: dark ? '#E8445A' : '#ef4444' }}>{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>{hint}</p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?:  string;
  dark?:  boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, dark = false, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          dark ? 'input-base' : 'input-light',
          'resize-none',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: dark ? '#E8445A' : '#ef4444' }}>{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>{hint}</p>
      )}
    </div>
  )
);
Textarea.displayName = 'Textarea';

// ─── Select ────────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:       string;
  error?:       string;
  options:      { value: string; label: string }[];
  placeholder?: string;
  dark?:        boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, dark = false, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            dark ? 'input-base' : 'input-light',
            'appearance-none pr-8 cursor-pointer',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: dark ? '#E8445A' : '#ef4444' }}>{error}</p>
      )}
    </div>
  )
);
Select.displayName = 'Select';