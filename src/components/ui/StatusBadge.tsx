import React from 'react';

const colorMap: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-300',
  approved: 'bg-green-500/15 text-green-300',
  rejected: 'bg-red-500/15 text-red-300',
  processed: 'bg-green-500/15 text-green-300',
  failed: 'bg-red-500/15 text-red-300',
  active: 'bg-blue-500/15 text-blue-300',
};

export function StatusBadge({ label }: { label: string }) {
  const key = label.toLowerCase();
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorMap[key] ?? 'bg-slate-800 text-slate-300'}`}>{label}</span>;
}
