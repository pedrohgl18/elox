import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="hidden w-64 border-r bg-white md:block">
      <div className="p-4 font-semibold">Menu</div>
      <nav className="space-y-1 p-2 text-sm">
        <Link href="/dashboard" className="block rounded px-3 py-2 hover:bg-gray-50">
          Dashboard (Usuário)
        </Link>
        <Link href="/admin/dashboard" className="block rounded px-3 py-2 hover:bg-gray-50">
          Dashboard (Admin)
        </Link>
      </nav>
    </aside>
  );
}
