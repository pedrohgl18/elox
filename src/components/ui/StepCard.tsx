import React from 'react';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-2">{step}</div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
