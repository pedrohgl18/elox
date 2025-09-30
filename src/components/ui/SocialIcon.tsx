"use client";

import React from 'react';

type Platform = 'tiktok' | 'instagram' | 'kwai' | 'youtube';

export interface SocialIconProps {
  platform: Platform;
  className?: string;
  size?: number; // pixel size for both width/height (default 16)
}

/**
 * SocialIcon
 * Pequeno ícone colorido para indicar a rede social.
 * Mantém o estilo e os SVGs usados no SocialPicker.
 */
export function SocialIcon({ platform, className = '', size = 16 }: SocialIconProps) {
  const common = `inline-block mr-1 ${className}`.trim();
  const dim = { width: size, height: size };

  if (platform === 'tiktok') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className={common} style={dim}>
        <path fill="#25F4EE" d="M44,18.4c-4.9-0.1-9.5-2.1-12.9-5.6V31c0,9.4-7.6,17-17,17S-3,40.4-3,31s7.6-17,17-17c1.3,0,2.6,0.2,3.8,0.5v8.7c-1.2-0.4-2.5-0.7-3.8-0.7c-5.1,0-9.3,4.1-9.3,9.3S8.9,40.1,14,40.1s9.3-4.1,9.3-9.3V0h8.6c0.9,5,4.7,9,9.6,10.2V18.4z"/>
        <path fill="#FE2C55" d="M31.1,0v8.1c3.3,3.5,8,5.6,12.9,5.6v8.4c-4.9-0.1-9.6-2.2-12.9-5.6V31c0,9.4-7.6,17-17,17c-5.9,0-11.1-3-14.1-7.6 c2.9,2.4,6.6,3.8,10.6,3.8c9.4,0,17-7.6,17-17V0H31.1z"/>
      </svg>
    );
  }
  if (platform === 'instagram') {
    const id = `ig-grad-${Math.random().toString(36).slice(2, 7)}`; // evitar colisões de id
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={common} style={dim}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F58529" />
            <stop offset="50%" stopColor="#DD2A7B" />
            <stop offset="100%" stopColor="#515BD4" />
          </linearGradient>
        </defs>
        <path fill={`url(#${id})`} d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10a5 5 0 0 0 0-10zm6.5-1.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3z" />
      </svg>
    );
  }
  if (platform === 'kwai') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" className={common} style={dim}>
        <path fill="#FF6B00" d="M47 10c3.9 0 7 3.1 7 7v30c0 3.9-3.1 7-7 7H17c-3.9 0-7-3.1-7-7V17c0-3.9 3.1-7 7-7h30zM24 24a6 6 0 1 0 0 12a6 6 0 0 0 0-12zm16 0a6 6 0 1 0 0 12a6 6 0 0 0 0-12z" />
      </svg>
    );
  }
  // youtube
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={common} style={dim}>
      <path fill="#FF0000" d="M23.5 6.2s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C17.5 2.5 12 2.5 12 2.5h0s-5.5 0-8.5.4c-.4 0-1.3.1-2.1 1-.7.7-.9 2.3-.9 2.3S0 8.2 0 10.2v1.6c0 2 .2 4 .2 4s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.5.4 7.5.4s5.5 0 8.5-.4c.4 0 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-2 .2-4v-1.6c0-2-.2-4-.2-4z" />
      <path fill="#fff" d="M9.75 8.5v6l6-3-6-3z" />
    </svg>
  );
}
