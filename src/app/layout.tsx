import "@/styles/globals.css";
import type { ReactNode } from "react";
import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
