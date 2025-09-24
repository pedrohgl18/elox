import Link from 'next/link';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function PublicHeader() {
  const session: any = await getServerSession(authOptions as any);
  const isLogged = !!session?.user;

  return (
  <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between bg-black/20 backdrop-blur rounded-xl mt-4">
      <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent hover:opacity-90 transition">
        EloX
      </Link>
      <nav className="flex items-center gap-3">
        <Link href="#beneficios" className="text-gray-300 hover:text-white">Benefícios</Link>
        <Link href="#recursos" className="text-gray-300 hover:text-white">Recursos</Link>
        <Link href="#como-funciona" className="text-gray-300 hover:text-white">Como funciona</Link>
        <Link href="#para-quem-e" className="text-gray-300 hover:text-white">Para quem é</Link>
        <Link href="#depoimentos" className="text-gray-300 hover:text-white">Depoimentos</Link>
        {isLogged ? (
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 active:scale-[0.98] transition">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        ) : (
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-[0.98] transition">
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
