import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = false, ...props }: CardProps & any) {
  return (
    <motion.div
      whileHover={hover ? { translateY: -2 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden',
        onClick && 'cursor-pointer hover:border-[var(--accent-red)] transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4 border-b border-[var(--border-color)]', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 py-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)]', className)}>{children}</div>;
}
