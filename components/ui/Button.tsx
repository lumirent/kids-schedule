import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95',
      secondary: 'bg-secondary text-primary dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-primary/10 active:scale-95',
      ghost: 'bg-transparent text-gray-500 hover:bg-muted dark:hover:bg-gray-800',
      outline: 'bg-transparent border-2 border-border dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary/30',
      danger: 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-xl font-bold',
      md: 'px-5 py-2.5 text-sm font-black rounded-2xl',
      lg: 'px-6 py-4 text-base font-black rounded-[1.5rem]',
      xl: 'px-8 py-5 text-sm font-black rounded-[2rem]',
      icon: 'w-10 h-10 rounded-2xl flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
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
