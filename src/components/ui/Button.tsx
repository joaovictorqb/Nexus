import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--accent-red)] text-white hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(255,0,0,0.15)]',
      secondary: 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-white transition-all',
      outline: 'border border-[var(--border-color)] text-white hover:bg-[rgba(255,0,0,0.05)] active:bg-[rgba(255,0,0,0.1)]',
      ghost: 'text-[var(--text-secondary)] hover:text-white',
      danger: 'bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-[12px] font-bold uppercase tracking-wider',
      lg: 'px-6 py-3 text-[14px] font-bold uppercase tracking-wider',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
