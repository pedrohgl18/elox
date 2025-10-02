import React from 'react';

export interface FAQItem { q: string; a: string }

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 sm:space-y-4">
        {items.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg sm:p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span className="text-base font-semibold text-slate-900 sm:text-lg">{item.q}</span>
              <span className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden>
                ⌄
              </span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
