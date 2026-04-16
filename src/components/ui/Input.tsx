import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[1px]">{label}</label>}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent-red)] transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-[var(--accent-red)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              leftIcon && 'pl-10',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[1px]">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-[13px] text-zinc-100 outline-none focus:border-[var(--accent-red)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[1px]">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-[var(--accent-red)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
