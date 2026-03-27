import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, error, label, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);

    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-institutional-500 focus:border-institutional-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
});
Input.displayName = "Input";
