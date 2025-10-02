import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div
      className={`rounded-2xl border border-sky-100 bg-white shadow-md p-6 flex flex-col items-center text-center transition-shadow hover:shadow-xl ${color ?? ''}`}
    >
      <div className="mb-3 text-sky-600">{icon}</div>
      <h3 className="font-bold text-lg mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}
