import React from 'react';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-base font-bold text-sky-700">
        {step}
      </div>
      <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}
