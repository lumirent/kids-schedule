import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'muted';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-900 border border-border dark:border-gray-800 shadow-sm',
      glass: 'glass shadow-xl shadow-indigo-100/20 dark:shadow-none',
      muted: 'bg-muted/50 dark:bg-gray-900/50 border border-dashed border-border dark:border-gray-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[2.5rem] p-6 transition-all duration-300',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
