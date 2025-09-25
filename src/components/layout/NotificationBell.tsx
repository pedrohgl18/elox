"use client";
import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

type Item = { id: string; title: string; message?: string; createdAt: string; readAt?: string };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const unread = items.filter(i => !i.readAt).length;

  async function fetchItems() {
    try {
      const res = await fetch('/api/notifications?limit=20', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setItems((data as any[]).map(n => ({ id: n.id, title: n.title, message: n.message, createdAt: n.createdAt, readAt: n.readAt })));
    } catch {}
  }

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    fetchItems();
  }

  useEffect(() => {
    fetchItems();
    const id = setInterval(fetchItems, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors relative">
        <Bell className="h-5 w-5" aria-label="Notificações" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-slate-900 rounded-lg shadow-lg border border-slate-800 py-2 z-50">
          <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-800">
            <span className="text-sm text-slate-300">Notificações</span>
            <button onClick={markAllRead} className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1">
              <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-400">Sem notificações</div>
            )}
            {items.map((n) => (
              <div key={n.id} className={`px-3 py-2 border-b border-slate-800/50 ${!n.readAt ? 'bg-slate-800/40' : ''}`}>
                <div className="text-sm text-slate-100">{n.title}</div>
                {n.message && <div className="text-xs text-slate-400">{n.message}</div>}
                <div className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
