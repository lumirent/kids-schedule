import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-muted dark:bg-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary/20 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full bg-muted dark:bg-gray-800 dark:text-gray-200 border-2 border-transparent focus:border-primary/20 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all appearance-none cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
