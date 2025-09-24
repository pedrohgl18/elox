import React from 'react';

export function Alert({ title, description, variant = 'info' }: { title?: string; description?: string; variant?: 'info' | 'success' | 'warning' | 'error' }) {
  const styles: Record<string, string> = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <div className={`rounded-lg border px-4 py-3 ${styles[variant]}`}>
      {title && <div className="font-medium">{title}</div>}
      {description && <div className="text-sm opacity-90">{description}</div>}
    </div>
  );
}
