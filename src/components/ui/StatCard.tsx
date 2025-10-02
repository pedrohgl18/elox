import React from 'react';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  accentClass?: string;
}

export function StatCard({ icon, label, value, accentClass }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-md p-5 flex items-center gap-4 ${accentClass ?? ''}`}>
      {icon && <div className="shrink-0 text-sky-600">{icon}</div>}
      <div>
        <div className="text-2xl font-extrabold text-slate-900 leading-tight">{value}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      </div>
    </div>
  );
}
