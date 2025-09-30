/**
 * Configurações da aplicação que se adaptam ao ambiente
 * Resolve dependência de portas específicas
 */

// Detecta automaticamente a URL base da aplicação
export function getBaseUrl(): string {
  // Client-side: confia na origem atual (dinâmico, independente de porta)
  if (typeof window !== 'undefined') return window.location.origin;
  // Server: prioriza URLs explícitas do ambiente (Netlify/Vercel)
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL as string;
  if (process.env.URL) return process.env.URL as string; // Netlify primary URL
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.SITE_URL) return process.env.SITE_URL as string;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL as string;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Fallback neutro (não depende de porta)
  return 'http://localhost';
}

// Configurações da aplicação
export const config = {
  // URL base que se adapta ao ambiente
  baseUrl: getBaseUrl(),
  
  // URLs da aplicação
  urls: {
    login: '/auth/login',
    adminDashboard: '/admin',
    userDashboard: '/dashboard',
  },

  // Configurações de autenticação
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'elox-fallback-secret-dev-only',
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Configurações para produção vs desenvolvimento
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export default config;