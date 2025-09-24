import React from 'react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-bold">EloX</div>
        <nav className="text-sm text-gray-600">Bem-vindo</nav>
      </div>
    </header>
  );
}
