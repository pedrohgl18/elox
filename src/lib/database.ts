import { Competition, Payment, PaymentStatus, Video, VideoStatus, Clipador, SocialAccount } from '@/lib/types';
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
  participants: { competitionId: string; clipadorId: string; joinedAt: Date }[] = [];
  socialAccounts: SocialAccount[] = [];
  settingsStore: { socialApiKeys: { tiktok?: string; instagram?: string; kwai?: string; youtube?: string } } = { socialApiKeys: {} };

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
        rules: { cpm: 5, allowedPlatforms: ['tiktok','instagram','kwai','youtube'], requiredHashtags: ['#elox'], requiredMentions: ['@eloxoficial'] },
        rewards: [
          { fromPlace: 1, toPlace: 1, amount: 5000 },
          { fromPlace: 2, toPlace: 2, amount: 3000 },
          { fromPlace: 3, toPlace: 3, amount: 2000 },
        ],
        assets: {
          audioLinks: [
            { platform: 'tiktok', url: 'https://www.tiktok.com/music/0000', label: 'Áudio oficial TikTok' },
          ],
        },
        phases: [
          { name: 'Antecipação', startDate: new Date(Date.now() - 24*60*60*1000), endDate: new Date(), description: 'Pré-campanha' },
          { name: 'Campanha', startDate: new Date(), endDate: new Date(Date.now() + 7 * 24*60*60*1000) }
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
    create: async (user: AuthUserRecord, url: string, social: Video['socialMedia'], competitionId?: string | null) => {
      const video: Video = {
        id: uid('v_'),
        clipadorId: user.id,
        url,
        socialMedia: social,
        views: 0,
        earnings: 0,
        status: VideoStatus.Pending,
        submittedAt: new Date(),
        competitionId: competitionId ?? undefined,
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
  rules: { allowedPlatforms: ['tiktok','instagram','kwai','youtube'], ...(payload.rules || {}) },
        assets: payload.assets,
        phases: payload.phases,
      } as Competition;
      this.competitions.push(c);
      return c;
    },
    patch: async (
      id: string,
      data: Partial<Pick<Competition, 'name' | 'startDate' | 'endDate' | 'isActive' | 'rules' | 'assets' | 'phases'>>,
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
    listEnrolledForUser: async (clipadorId: string) => {
      const enrolledIds = new Set(this.participants.filter(p => p.clipadorId === clipadorId).map(p => p.competitionId));
      return this.competitions.filter(c => enrolledIds.has(c.id));
    },
    isUserEnrolled: async (clipadorId: string, competitionId: string) => {
      return this.participants.some(p => p.clipadorId === clipadorId && p.competitionId === competitionId);
    },
    enroll: async (clipadorId: string, competitionId: string) => {
      const exists = this.participants.some(p => p.clipadorId === clipadorId && p.competitionId === competitionId);
      if (!exists) this.participants.push({ clipadorId, competitionId, joinedAt: new Date() });
      return true;
    },
  };

  // Social accounts CRUD (mock)
  social = {
    listAll: async () => this.socialAccounts,
    listForUser: async (clipadorId: string) => {
      return this.socialAccounts.filter(a => a.clipadorId === clipadorId);
    },
    create: async (clipadorId: string, payload: { platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; username: string }) => {
      // Em produção, criaria via OAuth; aqui simulamos verificação automática
      const a: SocialAccount = {
        id: uid('sa_'),
        clipadorId,
        platform: payload.platform,
        username: payload.username,
        status: 'verified',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.socialAccounts.push(a);
      return a;
    },
    patch: async (id: string, data: Partial<Pick<SocialAccount, 'username' | 'status'>>) => {
      const a = this.socialAccounts.find(x => x.id === id);
      if (!a) return null;
      Object.assign(a, data);
      a.updatedAt = new Date();
      return a;
    },
    remove: async (id: string) => {
      const before = this.socialAccounts.length;
      this.socialAccounts = this.socialAccounts.filter(x => x.id !== id);
      return this.socialAccounts.length < before;
    },
    setStatus: async (id: string, status: 'pending' | 'verified' | 'revoked') => {
      const a = this.socialAccounts.find(x => x.id === id);
      if (!a) return null;
      a.status = status;
      a.updatedAt = new Date();
      return a;
    },
  };

  // Ranking/Aggregation helpers
  leaderboard = {
    // Ranking global por clipador agregando views/earnings e contagem de vídeos aprovados
    global: async () => {
      const byUser: Record<string, { username: string; totalEarnings: number; totalViews: number; approvedVideos: number; totalVideos: number }> = {};
      // Inicializa todos os clipadores
      for (const u of this.users.filter((x) => x.role === 'clipador')) {
        byUser[u.id] = { username: u.username, totalEarnings: 0, totalViews: 0, approvedVideos: 0, totalVideos: 0 };
      }
      // Agrega vídeos
      for (const v of this.videos) {
        const u = this.users.find((x) => x.id === v.clipadorId);
        if (!u) continue;
        const key = u.id;
        if (!byUser[key]) byUser[key] = { username: u.username, totalEarnings: 0, totalViews: 0, approvedVideos: 0, totalVideos: 0 };
        byUser[key].totalViews += v.views || 0;
        byUser[key].totalVideos += 1;
        if (v.status === VideoStatus.Approved) byUser[key].approvedVideos += 1;
      }
      // Agrega pagamentos processados como ganhos
      for (const p of this.payments) {
        if (p.status !== PaymentStatus.Processed) continue;
        const u = this.users.find((x) => x.id === p.clipadorId);
        if (!u) continue;
        const key = u.id;
        if (!byUser[key]) byUser[key] = { username: u.username, totalEarnings: 0, totalViews: 0, approvedVideos: 0, totalVideos: 0 };
        byUser[key].totalEarnings += p.amount || 0;
      }
      const rows = Object.values(byUser).sort((a, b) => b.totalEarnings - a.totalEarnings || b.totalViews - a.totalViews);
      return rows;
    },
    // Ranking por competição simples (top por views dentro do período inteiro da competição)
    competitionByViews: async (competitionId: string, opts?: { limitPerLevel?: number }) => {
      const comp = this.competitions.find((c) => c.id === competitionId);
      if (!comp) return null;
      // Filtra vídeos aprovados desta competição
      const vids = this.videos.filter((v) => v.competitionId === competitionId && v.status === VideoStatus.Approved);
      // Níveis default conforme especificação
      const levels = [
        { name: 'Level 5', prize: 150, maxWinners: 3, minViews: 0 },
        { name: 'Level 4', prize: 75, maxWinners: 5, minViews: 0 },
        { name: 'Level 3', prize: 30, maxWinners: 10, minViews: 0 },
        { name: 'Level 2', prize: 15, maxWinners: 15, minViews: 0 },
        { name: 'Level 1', prize: 5, maxWinners: 20, minViews: 0 },
      ];
      // Se admin configurou minViews na competição, usa como piso do Level 1
      if (comp.rules?.minViews) levels[4].minViews = comp.rules.minViews;
      // Estratégia simplificada: ordena todos por views e distribui nos níveis de cima para baixo
      const sorted = [...vids].sort((a, b) => b.views - a.views);
      // Aplicar restrições: até 2 vídeos premiados por usuário por nível e até 4 no total; cada vídeo só pode ganhar em um nível
      const perUserTotal: Record<string, number> = {};
      const usedVideos = new Set<string>();
      const results = levels.map((lvl, idx) => {
        const winners: Array<{ videoId: string; username: string; clipadorId: string; views: number; place: number }> = [];
        const perUserLevel: Record<string, number> = {};
        for (const v of sorted) {
          if (winners.length >= lvl.maxWinners) break;
          if (usedVideos.has(v.id)) continue;
          if (lvl.minViews && v.views < lvl.minViews) continue;
          const user = this.users.find((x) => x.id === v.clipadorId);
          if (!user) continue;
          const tot = perUserTotal[user.id] || 0;
          if (tot >= 4) continue; // limite diário agregado (aplicado aqui como simplificação)
          const lvlCount = perUserLevel[user.id] || 0;
          if (lvlCount >= 2) continue; // máximo 2 por nível
          winners.push({ videoId: v.id, username: user.username, clipadorId: user.id, views: v.views, place: winners.length + 1 });
          perUserLevel[user.id] = lvlCount + 1;
          perUserTotal[user.id] = tot + 1;
          usedVideos.add(v.id);
        }
        return { level: 5 - idx, name: lvl.name, prize: lvl.prize, maxWinners: lvl.maxWinners, winners };
      });
      return { competitionId, name: comp.name, levels: results };
    },
    // Ranking por quantidade de vídeos (aprovados) por plataforma ou todas
    countByVideos: async (platform?: 'tiktok' | 'instagram' | 'kwai' | 'all') => {
      const byUser: Record<string, { username: string; total: number }> = {};
      for (const v of this.videos) {
        if (v.status !== VideoStatus.Approved) continue;
        if (platform && platform !== 'all' && v.socialMedia !== platform) continue;
        const u = this.users.find((x) => x.id === v.clipadorId);
        if (!u) continue;
        const key = u.id;
        if (!byUser[key]) byUser[key] = { username: u.username, total: 0 };
        byUser[key].total += 1;
      }
      return Object.values(byUser).sort((a, b) => b.total - a.total);
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

  settings = {
    get: async () => this.settingsStore,
    updateSocialApis: async (payload: Partial<{ tiktok: string; instagram: string; kwai: string; youtube: string }>) => {
      this.settingsStore.socialApiKeys = { ...this.settingsStore.socialApiKeys, ...payload };
      return this.settingsStore.socialApiKeys;
    },
  };
}

// Exporta adaptador dinâmico: tenta Supabase primeiro, fallback para memória
const supabaseAdapter = createSupabaseAdapter();
const memory = new InMemoryDB();
// Adiciona helper de finanças (tanto no adapter quanto no fallback)
function attachFinance(api: any) {
  api.finance = api.finance || {};
  api.finance.getUserEarningsSummary = async (userId: string) => {
    // Soma ganhos estimados usando CPM das competições
    const videos: Video[] = await api.video.listForUser({ id: userId, role: 'clipador' } as any);
    let lifetime = 0;
    for (const v of videos) {
      if (v.status !== VideoStatus.Approved) continue;
      let cpm = 0;
      if (v.competitionId) {
        const comp = await api.competition.getById(v.competitionId);
        cpm = comp?.rules?.cpm ?? 0;
      }
      lifetime += ((v.views || 0) / 1000) * (cpm || 0);
    }
    // Pagamentos
    const allPays: Payment[] = await api.payment.listForUser({ id: userId, role: 'clipador' } as any);
    const processed = allPays.filter((p: Payment) => p.status === PaymentStatus.Processed).reduce((s: number, p: Payment) => s + p.amount, 0);
    const pending = allPays.filter((p: Payment) => p.status === PaymentStatus.Pending).reduce((s: number, p: Payment) => s + p.amount, 0);
    const available = Math.max(0, lifetime - processed - pending);
    return { lifetime, processed, pending, available };
  };
  return api;
}

export const db: any = attachFinance(supabaseAdapter ?? memory);
