import React from 'react';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  accentClass?: string;
}

export function StatCard({ icon, label, value, accentClass }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 shadow-sm p-5 flex items-center gap-4 ${accentClass ?? ''}`}>
      {icon && <div className="shrink-0">{icon}</div>}
      <div>
        <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
        <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      </div>
    </div>
  );
}
