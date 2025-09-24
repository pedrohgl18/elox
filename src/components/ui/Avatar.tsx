'use client';

import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ username = 'User', size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  // Gera iniciais do username
  const initials = username
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'U';

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-brand-600 text-white rounded-full 
        flex items-center justify-center 
        font-semibold shadow-sm
        ${className}
      `}
    >
      {initials}
    </div>
  );
}