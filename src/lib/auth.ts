type NextAuthOptions = any;
type User = any;
type JWT = any;
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/database';
import { config } from '@/lib/config';

export type AppRole = 'admin' | 'clipador';

export interface SessionUser extends User {
  id: string;
  email: string;
  username: string;
  role: AppRole;
  name?: string | null;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: config.auth.secret,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await db.auth.findByEmailAndPassword(credentials.email, credentials.password);
        if (!user) return null;
        const sessionUser: SessionUser = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          name: user.username,
        };
        return sessionUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: SessionUser | null }) {
      if (user) {
        const u = user as SessionUser;
        token.id = u.id;
        token.role = u.role;
        token.username = u.username;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as AppRole;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Se a URL já é um caminho relativo, usar baseUrl + url
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Se a URL já começa com baseUrl, retornar como está
      if (url.startsWith(baseUrl)) return url;
      // Redirecionamento padrão será determinado no componente de login
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

// Helper opcional poderia importar getServerSession, mas para evitar conflitos de tipos entre versões,
// usaremos o NextAuth handler diretamente nas rotas.
export const getServerAuthSession = undefined as unknown as never;
