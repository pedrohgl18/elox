"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms
}

interface ToastContextValue {
  show: (msg: string, opts?: { type?: ToastType; title?: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, opts?: { type?: ToastType; title?: string; duration?: number }) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      id,
      type: opts?.type || 'info',
      title: opts?.title,
      message,
      duration: opts?.duration ?? 3500,
    };
    setItems((prev) => [...prev, item]);
    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, item.duration);
    }
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
        {items.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border p-3 shadow-lg transition-all bg-slate-900/95 backdrop-blur-sm text-slate-100 border-slate-800`}
          >
            <div className="flex items-start gap-2">
              <div className={`mt-1 h-2 w-2 rounded-full ${
                t.type === 'success' ? 'bg-emerald-400' : t.type === 'error' ? 'bg-red-400' : t.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`} />
              <div className="flex-1">
                {t.title && <div className="text-sm font-medium">{t.title}</div>}
                <div className="text-sm opacity-90">{t.message}</div>
              </div>
              <button onClick={() => remove(t.id)} className="text-xs text-slate-400 hover:text-slate-200">Fechar</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
