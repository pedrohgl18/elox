'use client';

import React from 'react';

export type SelectProps = React.ComponentPropsWithoutRef<'select'> & {
  children?: React.ReactNode;
  className?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 ${className ?? ''}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
