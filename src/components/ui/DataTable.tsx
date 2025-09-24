'use client';

import React from 'react';

export type SimpleColumn = {
  key: string;
  label: string;
};

export function DataTable({ data, columns }: { data: any[]; columns: SimpleColumn[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-gradient-to-r from-slate-950 via-emerald-900/10 to-slate-950">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-slate-200 tracking-wide backdrop-blur-sm"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950">
          {data.map((row, i) => (
            <tr
              key={i}
              className="group transition-colors duration-200 hover:bg-slate-900 focus-within:bg-slate-900"
            >
              {columns.map((col, j) => (
                <td
                  key={j}
                  className="px-4 py-2 text-slate-100 transition-colors duration-200 group-hover:text-slate-100/95"
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
