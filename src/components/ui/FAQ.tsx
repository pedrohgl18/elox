import React from 'react';

export interface FAQItem { q: string; a: string }

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <details key={idx} className="group border rounded-lg p-4 bg-white shadow-sm">
          <summary className="flex justify-between items-center cursor-pointer">
            <span className="font-medium text-gray-900">{item.q}</span>
            <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
          </summary>
          <p className="text-gray-600 mt-2">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
