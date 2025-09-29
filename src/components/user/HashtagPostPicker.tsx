"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
// Removido: fluxo via social-accounts

type Platform = 'tiktok' | 'instagram' | 'kwai' | 'youtube';

export function HashtagPostPicker({ platform = 'youtube', onPick }: { platform?: Platform; onPick: (item: any) => void }) {
  return null;
}
