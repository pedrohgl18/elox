import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 shadow-sm p-6 flex flex-col items-center text-center ${color ?? ''}`}>
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}
