'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  defaultValue?: string | number | readonly string[];
  value?: string | number | readonly string[];
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 
      bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 
      dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 dark:placeholder:text-slate-500 ${className ?? ''}`}
      {...props}
    />
  );
});
