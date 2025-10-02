import "@/styles/globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from '@/components/ui/Toast';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning className={`${jakarta.variable} antialiased`}>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
