import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface TestimonialCardProps {
  name: string;
  text: string;
  social?: string;
}

export function TestimonialCard({ name, text, social }: TestimonialCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md p-6 flex flex-col items-center text-center">
      <Avatar username={name} className="mb-3" />
      <p className="text-slate-600 italic mb-2">&ldquo;{text}&rdquo;</p>
      <div className="font-semibold text-sky-700">{name}</div>
      {social && <div className="text-xs text-slate-500">{social}</div>}
    </div>
  );
}
