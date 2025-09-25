import React from 'react';

export interface FAQItem { q: string; a: string }

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 sm:space-y-4">
        {items.map((item, idx) => (
          <details
            key={idx}
            className="group border border-slate-800 rounded-lg p-4 sm:p-5 bg-slate-950/70 shadow-sm hover:shadow-md transition-shadow"
          >
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <span className="font-medium text-slate-100 text-base sm:text-lg">{item.q}</span>
              <span
                className="text-slate-400 group-open:rotate-180 transition-transform select-none"
                aria-hidden
              >
                ⌄
              </span>
            </summary>
            <p className="text-slate-300 mt-2 sm:mt-3 text-sm sm:text-base">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
