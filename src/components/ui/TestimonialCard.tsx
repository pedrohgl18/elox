import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

interface TestimonialCardProps {
  name: string;
  text: string;
  social?: string;
}

export function TestimonialCard({ name, text, social }: TestimonialCardProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-6 text-left shadow-[0_24px_46px_-28px_rgba(15,23,42,0.45)]">
      <div className="absolute inset-x-6 top-0 h-24 rounded-b-full bg-gradient-to-b from-sky-50 via-transparent to-transparent" />
      <div className="relative mb-4 flex items-center gap-3">
        <Avatar username={name} className="h-12 w-12" />
        <div>
          <p className="text-base font-semibold text-slate-900">{name}</p>
          {social && <span className="text-xs uppercase tracking-[0.25em] text-slate-400">{social}</span>}
        </div>
      </div>
      <p className="relative text-sm leading-relaxed text-slate-600">
        <span className="mr-2 text-2xl text-sky-500">“</span>
        {text}
        <span className="ml-1 text-2xl text-sky-500">”</span>
      </p>
      <div className="mt-auto pt-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
        Comunidade EloX
      </div>
    </div>
  );
}
