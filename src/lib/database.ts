import { Competition, Payment, PaymentStatus, Video, VideoStatus, Clipador } from '@/lib/types';
import { createSupabaseAdapter } from './supabaseAdapter';

export type Role = 'admin' | 'clipador';

export interface AuthUserRecord {
  id: string;
  email: string;
  username: string;
  password: string; // Somente para mock em memória
  role: Role;
  clipador?: Clipador; // presente quando role = 'clipador'
}

function uid(prefix: string = '') {
  return prefix + Math.random().toString(36).slice(2, 10);
}

class InMemoryDB {
  users: AuthUserRecord[] = [];
  videos: Video[] = [];
  payments: Payment[] = [];
  competitions: Competition[] = [];

  constructor() {
    // IDs fixos para estabilidade da sessão em ambiente de dev (banco em memória)
    const clipadorId = 'u_seed_clipador';
    const adminId = 'a_seed_admin';

    const clipador: Clipador = {
      id: clipadorId,
      username: 'clip_user',
      email: 'user@elox.dev',
      isActive: true,
      warnings: 0,
      totalEarnings: 0,
      createdAt: new Date(),
    };

    this.users.push(
      {
        id: adminId,
        email: 'admin@elox.dev',
        username: 'admin',
        password: 'admin',
        role: 'admin',
      },
      {
        id: clipadorId,
        email: clipador.email,
        username: clipador.username,
        password: 'user',
        role: 'clipador',
        clipador,
      }
    );

    if (process.env.ELOX_SEED === 'true') {
      // Exemplo inicial apenas para desenvolvimento controlado
      this.competitions.push({
        id: uid('c_'),
        name: 'Competição de Boas-Vindas',
        description: 'Primeira campanha para novos clipadores',
        bannerImageUrl: undefined,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        status: 'ACTIVE',
        rules: { cpm: 5, allowedPlatforms: ['tiktok','instagram','kwai'] },
        rewards: [
          { place: 1, amount: 5000 },
          { place: 2, amount: 3000 },
          { place: 3, amount: 2000 },
        ],
      });
    }
  }

  auth = {
    findByEmailAndPassword: async (email: string, password: string) => {
      const user = this.users.find((u) => u.email === email && u.password === password);
      console.log(`Login attempt: ${email}, found user:`, user ? { id: user.id, email: user.email, role: user.role } : 'null');
      return user || null;
    },
    getById: async (id: string) => {
      const user = this.users.find((u) => u.id === id);
      console.log(`getById: ${id}, found user:`, user ? { id: user.id, email: user.email, role: user.role } : 'null');
      return user || null;
    },
    getByIdOrEmail: async (idOrEmail: string) => {
      const user = this.users.find((u) => u.id === idOrEmail || u.email === idOrEmail);
      console.log(`getByIdOrEmail: ${idOrEmail}, found user:`, user ? { id: user.id, email: user.email, role: user.role } : 'null');
      return user || null;
    },
  };

  video = {
    listForUser: async (user: AuthUserRecord | null) => {
      if (!user) {
        console.error('listForUser chamado com user null');
        return [];
      }
      if (user.role === 'admin') return this.videos;
      return this.videos.filter((v) => v.clipadorId === user.id);
    },
    getById: async (id: string) => this.videos.find((v) => v.id === id) || null,
    create: async (user: AuthUserRecord, url: string, social: Video['socialMedia']) => {
      const video: Video = {
        id: uid('v_'),
        clipadorId: user.id,
        url,
        socialMedia: social,
        views: 0,
        earnings: 0,
        status: VideoStatus.Pending,
        submittedAt: new Date(),
      };
      this.videos.push(video);
      return video;
    },
    approve: async (id: string) => {
      const v = this.videos.find((x) => x.id === id);
      if (!v) return null;
      v.status = VideoStatus.Approved;
      v.validatedAt = new Date();
      return v;
    },
    reject: async (id: string) => {
      const v = this.videos.find((x) => x.id === id);
      if (!v) return null;
      v.status = VideoStatus.Rejected;
      v.validatedAt = new Date();
      return v;
    },
  };

  payment = {
    listForUser: async (user: AuthUserRecord | null) => {
      if (!user) {
        console.error('payment.listForUser chamado com user null');
        return [];
      }
      if (user.role === 'admin') return this.payments;
      return this.payments.filter((p) => p.clipadorId === user.id);
    },
    request: async (user: AuthUserRecord, amount: number) => {
      const p: Payment = {
        id: uid('p_'),
        clipadorId: user.id,
        amount,
        status: PaymentStatus.Pending,
        requestedAt: new Date(),
      };
      this.payments.push(p);
      return p;
    },
    markProcessed: async (id: string) => {
      const p = this.payments.find((x) => x.id === id);
      if (!p) return null;
      p.status = PaymentStatus.Processed;
      p.processedAt = new Date();
      return p;
    },
  };

  competition = {
  list: async () => this.competitions,
    getById: async (id: string) => this.competitions.find((c) => c.id === id) || null,
    create: async (payload: Omit<Competition, 'id' | 'isActive' | 'status'> & { isActive?: boolean; status?: Competition['status'] }) => {
      const now = Date.now();
      const status: Competition['status'] = payload.status
        ? payload.status
        : (now < new Date(payload.startDate).getTime() ? 'SCHEDULED' : (now > new Date(payload.endDate).getTime() ? 'COMPLETED' : 'ACTIVE'));
      const c: Competition = {
        id: uid('c_'),
        isActive: payload.isActive ?? true,
        status,
        rewards: payload.rewards ?? [],
        ...payload,
        rules: { allowedPlatforms: ['tiktok','instagram','kwai'], ...(payload.rules || {}) },
      } as Competition;
      this.competitions.push(c);
      return c;
    },
    patch: async (
      id: string,
      data: Partial<Pick<Competition, 'name' | 'startDate' | 'endDate' | 'isActive' | 'rules'>>,
    ) => {
      const c = this.competitions.find((x) => x.id === id);
      if (!c) return null;
      Object.assign(c, data);
      // recalcula status se datas mudarem
      const now = Date.now();
      c.status = now < c.startDate.getTime() ? 'SCHEDULED' : (now > c.endDate.getTime() ? 'COMPLETED' : 'ACTIVE');
      return c;
    },
    remove: async (id: string) => {
      const before = this.competitions.length;
      this.competitions = this.competitions.filter((x) => x.id !== id);
      return this.competitions.length < before;
    },
  };

  // Utilitários de administração
  admin = {
    listClipadores: async () => this.users.filter((u) => u.role === 'clipador'),
    toggleClipadorActive: async (id: string) => {
      const u = this.users.find((x) => x.id === id && x.role === 'clipador');
      if (!u || !u.clipador) return null;
      u.clipador.isActive = !u.clipador.isActive;
      return u.clipador;
    },
    addWarning: async (id: string) => {
      const u = this.users.find((x) => x.id === id && x.role === 'clipador');
      if (!u || !u.clipador) return null;
      u.clipador.warnings += 1;
      return u.clipador.warnings;
    },
  };
}

// Exporta adaptador dinâmico: tenta Supabase primeiro, fallback para memória
const supabaseAdapter = createSupabaseAdapter();
export const db: any = supabaseAdapter ?? new InMemoryDB();
