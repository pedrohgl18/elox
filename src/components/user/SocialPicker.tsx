"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';

type Social = 'tiktok' | 'instagram' | 'kwai';

interface Props {
  value: Social | '';
  onChange: (v: Social | '') => void;
}

const socials: { key: Social; label: string; color: string }[] = [
  { key: 'tiktok', label: 'TikTok', color: 'from-fuchsia-500 to-cyan-400' },
  { key: 'instagram', label: 'Instagram', color: 'from-pink-500 to-yellow-400' },
  { key: 'kwai', label: 'Kwai', color: 'from-orange-500 to-amber-400' },
];

export function SocialPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {socials.map(s => {
        const active = value === s.key;
        return (
          <Button
            key={s.key}
            type="button"
            variant={active ? 'primary' : 'outline'}
            className={
              active
                ? `bg-gradient-to-r ${s.color} text-white border-0`
                : 'bg-transparent text-slate-200 border-slate-700 hover:bg-slate-800'
            }
            onClick={() => onChange(active ? '' : s.key)}
          >
            {s.label}
          </Button>
        );
      })}
    </div>
  );
}
