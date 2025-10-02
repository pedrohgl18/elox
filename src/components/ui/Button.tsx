'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:brightness-110 focus:ring-sky-500',
        success: 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 focus:ring-emerald-500',
        danger: 'bg-rose-600 text-white shadow-lg hover:bg-rose-500 focus:ring-rose-500',
        outline: 'border border-slate-200 text-slate-700 hover:bg-white/70 focus:ring-sky-500',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={clsx(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
