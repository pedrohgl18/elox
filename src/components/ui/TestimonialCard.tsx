import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface TestimonialCardProps {
  name: string;
  text: string;
  social?: string;
}

export function TestimonialCard({ name, text, social }: TestimonialCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 shadow p-6 flex flex-col items-center text-center">
      <Avatar username={name} className="mb-3" />
      <p className="text-gray-200 italic mb-2">&ldquo;{text}&rdquo;</p>
      <div className="font-semibold text-indigo-300">{name}</div>
      {social && <div className="text-xs text-gray-400">{social}</div>}
    </div>
  );
}
