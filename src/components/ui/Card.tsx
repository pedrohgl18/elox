import React from 'react';

export function Card({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-slate-800 bg-slate-900 shadow-sm ${className ?? ''}`}>{children}</div>;
}

export function CardHeader({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-slate-800 text-slate-200 ${className ?? ''}`}>{children}</div>;
}

export function CardContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 text-slate-100 ${className ?? ''}`}>{children}</div>;
}
