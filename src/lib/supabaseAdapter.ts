import { getSupabaseClient, getSupabaseServiceClient } from './supabaseClient';
import { Competition, Payment, PaymentStatus, Video, VideoStatus, Clipador } from './types';
import { AuthUserRecord, Role } from './database';
import bcrypt from 'bcryptjs';

// Tipos de linhas vindas do Supabase
interface ProfileRow {
  id: string;
  email: string;
  username: string;
  role: Role;
  is_active: boolean;
  warnings: number;
  total_earnings: number;
  pix_key: string | null;
  created_at: string;
}

interface VideoRow {
  id: string;
  clipador_id: string;
  url: string;
  social_media: Video['socialMedia'];
  views: number;
  earnings: number;
  status: VideoStatus;
  submitted_at: string;
  validated_at: string | null;
  competition_id: string | null;
}

interface PaymentRow {
  id: string;
  clipador_id: string;
  amount: string; // numeric
  status: PaymentStatus;
  requested_at: string;
  processed_at: string | null;
}

interface CompetitionRow {
  id: string;
  name: string;
  description: string | null;
  banner_image_url: string | null;
  start_date: string; // date
  end_date: string; // date
  is_active: boolean;
  status: Competition['status'];
  allowed_platforms: string[];
  created_at: string;
}

interface CompetitionRewardRow {
  id: string;
  competition_id: string;
  from_place: number;
  to_place: number;
  amount: string;
  platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube' | null;
  description: string | null;
}

function mapProfile(p: ProfileRow): AuthUserRecord {
  const clipador: Clipador | undefined = p.role === 'clipador' ? {
    id: p.id,
    username: p.username,
    email: p.email,
    isActive: p.is_active,
    warnings: p.warnings,
    totalEarnings: Number(p.total_earnings),
    pixKey: p.pix_key ?? undefined,
    createdAt: new Date(p.created_at),
  } : undefined;
  return {
    id: p.id,
    email: p.email,
    username: p.username,
    password: '', // Não expomos hash aqui – auth real virá depois
    role: p.role,
    clipador,
  };
}

function mapVideo(v: VideoRow): Video {
  return {
    id: v.id,
    clipadorId: v.clipador_id,
    url: v.url,
    socialMedia: v.social_media,
    views: Number(v.views),
    earnings: Number(v.earnings),
    status: v.status,
    submittedAt: new Date(v.submitted_at),
    validatedAt: v.validated_at ? new Date(v.validated_at) : undefined,
    competitionId: v.competition_id ?? undefined,
  };
}

function mapPayment(p: PaymentRow): Payment {
  return {
    id: p.id,
    clipadorId: p.clipador_id,
    amount: Number(p.amount),
    status: p.status,
    requestedAt: new Date(p.requested_at),
    processedAt: p.processed_at ? new Date(p.processed_at) : undefined,
  };
}

function mapCompetition(c: CompetitionRow, rewards: CompetitionRewardRow[]): Competition {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? undefined,
    bannerImageUrl: c.banner_image_url ?? undefined,
    startDate: new Date(c.start_date),
    endDate: new Date(c.end_date),
    isActive: c.is_active,
    status: c.status,
  rules: { allowedPlatforms: c.allowed_platforms as any },
    rewards: rewards
      .sort((a, b) => a.from_place - b.from_place)
      .map(r => ({ fromPlace: r.from_place, toPlace: r.to_place, amount: Number(r.amount), platform: r.platform ?? undefined, description: r.description ?? undefined })),
  };
}

export function createSupabaseAdapter() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  return {
    auth: {
      findByEmailAndPassword: async (email: string, password: string) => {
        // Busca somente pelas colunas necessárias
        const svc = getSupabaseServiceClient();
        const cli = svc || supabase; // fallback se não houver service key (dev)
        const { data, error } = await cli
          .from('profiles')
          .select('id,email,username,role,is_active,warnings,total_earnings,pix_key,created_at,password_hash')
          .eq('email', email)
          .limit(1)
          .maybeSingle();
        if (error || !data) return null;
        const row = data as ProfileRow & { password_hash: string | null };
        if (!row.password_hash) return null;
        const ok = await bcrypt.compare(password, row.password_hash);
        if (!ok) return null;
        return mapProfile(row);
      },
      getById: async (id: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error || !data) return null;
        return mapProfile(data as ProfileRow);
      },
      getByIdOrEmail: async (key: string) => {
        const { data, error } = await supabase.from('profiles').select('*').or(`id.eq.${key},email.eq.${key}`).limit(1).maybeSingle();
        if (error || !data) return null;
        return mapProfile(data as ProfileRow);
      },
    },
    leaderboard: {
      global: async () => {
        // Busca todos clipadores
        const profiles = await supabase.from('profiles').select('id,username,role').eq('role', 'clipador');
        const byUser: Record<string, { username: string; totalEarnings: number; totalViews: number; approvedVideos: number; totalVideos: number }> = {};
        if (!profiles.error && profiles.data) {
          for (const p of profiles.data as any[]) {
            byUser[p.id] = { username: p.username, totalEarnings: 0, totalViews: 0, approvedVideos: 0, totalVideos: 0 };
          }
        }
        // Agrega vídeos
        const vids = await supabase.from('videos').select('clipador_id,views,status');
        if (!vids.error && vids.data) {
          for (const v of vids.data as any[]) {
            const key = v.clipador_id as string;
            if (!byUser[key]) byUser[key] = { username: key, totalEarnings: 0, totalViews: 0, approvedVideos: 0, totalVideos: 0 };
            byUser[key].totalViews += Number(v.views) || 0;
            byUser[key].totalVideos += 1;
            if (v.status === 'APPROVED') byUser[key].approvedVideos += 1;
          }
        }
        // Agrega pagamentos processados
        const pays = await supabase.from('payments').select('clipador_id,amount,status').eq('status', 'PROCESSED');
        if (!pays.error && pays.data) {
          for (const p of pays.data as any[]) {
            const key = p.clipador_id as string;
            if (!byUser[key]) byUser[key] = { username: key, totalEarnings: 0, totalViews: 0, approvedVideos: 0, totalVideos: 0 };
            byUser[key].totalEarnings += Number(p.amount) || 0;
          }
        }
        return Object.values(byUser).sort((a, b) => b.totalEarnings - a.totalEarnings || b.totalViews - a.totalViews);
      },
      competitionByViews: async (competitionId: string) => {
        const compResp = await supabase.from('competitions').select('*').eq('id', competitionId).single();
        if (compResp.error || !compResp.data) return null;
        const comp = mapCompetition(compResp.data as any, []);
        const vids = await supabase
          .from('videos')
          .select('id,clipador_id,views,status')
          .eq('competition_id', competitionId)
          .eq('status', 'APPROVED');
        const profiles = await supabase.from('profiles').select('id,username');
        const usernameById = new Map<string, string>();
        if (!profiles.error && profiles.data) {
          (profiles.data as any[]).forEach(p => usernameById.set(p.id, p.username));
        }
        const list = (vids.data as any[] || []).map(v => ({ id: v.id as string, clipadorId: v.clipador_id as string, views: Number(v.views) || 0 }));
        const levels = [
          { name: 'Level 5', prize: 150, maxWinners: 3, minViews: 0 },
          { name: 'Level 4', prize: 75, maxWinners: 5, minViews: 0 },
          { name: 'Level 3', prize: 30, maxWinners: 10, minViews: 0 },
          { name: 'Level 2', prize: 15, maxWinners: 15, minViews: 0 },
          { name: 'Level 1', prize: 5, maxWinners: 20, minViews: 0 },
        ];
        if (comp.rules?.minViews) levels[4].minViews = comp.rules.minViews;
        const sorted = [...list].sort((a, b) => b.views - a.views);
        const perUserTotal: Record<string, number> = {};
        const results = levels.map((lvl, idx) => {
          const winners: Array<{ videoId: string; username: string; clipadorId: string; views: number; place: number }> = [];
          const perUserLevel: Record<string, number> = {};
          for (const v of sorted) {
            if (winners.length >= lvl.maxWinners) break;
            if (lvl.minViews && v.views < lvl.minViews) continue;
            const tot = perUserTotal[v.clipadorId] || 0;
            if (tot >= 4) continue;
            const lvlCount = perUserLevel[v.clipadorId] || 0;
            if (lvlCount >= 2) continue;
            if (winners.some((w) => w.videoId === v.id)) continue;
            winners.push({ videoId: v.id, username: usernameById.get(v.clipadorId) || v.clipadorId, clipadorId: v.clipadorId, views: v.views, place: winners.length + 1 });
            perUserLevel[v.clipadorId] = lvlCount + 1;
            perUserTotal[v.clipadorId] = tot + 1;
          }
          return { level: 5 - idx, name: lvl.name, prize: lvl.prize, maxWinners: lvl.maxWinners, winners };
        });
        return { competitionId, name: comp.name, levels: results };
      },
      countByVideos: async (platform?: 'tiktok' | 'instagram' | 'kwai' | 'all') => {
        let query = supabase.from('videos').select('clipador_id,status,social_media');
        const { data, error } = await query;
        if (error || !data) return [];
        const byUser: Record<string, { username: string; total: number }> = {};
        const profiles = await supabase.from('profiles').select('id,username');
        const usernameById = new Map<string, string>();
        if (!profiles.error && profiles.data) (profiles.data as any[]).forEach(p => usernameById.set(p.id, p.username));
        for (const v of data as any[]) {
          if (v.status !== 'APPROVED') continue;
          if (platform && platform !== 'all' && v.social_media !== platform) continue;
          const key = v.clipador_id as string;
          if (!byUser[key]) byUser[key] = { username: usernameById.get(key) || key, total: 0 };
          byUser[key].total += 1;
        }
        return Object.values(byUser).sort((a, b) => b.total - a.total);
      }
    },
    video: {
      listForUser: async (user: AuthUserRecord | null) => {
        if (!user) return [];
        let query = supabase.from('videos').select('*');
        if (user.role !== 'admin') query = query.eq('clipador_id', user.id);
        const { data, error } = await query;
        if (error || !data) return [];
        return (data as VideoRow[]).map(mapVideo);
      },
      getById: async (id: string) => {
        const { data, error } = await supabase.from('videos').select('*').eq('id', id).single();
        if (error || !data) return null;
        return mapVideo(data as VideoRow);
      },
      create: async (user: AuthUserRecord, url: string, social: Video['socialMedia'], competitionId?: string | null) => {
        const insert: any = { clipador_id: user.id, url, social_media: social };
        if (competitionId) insert.competition_id = competitionId;
        const { data, error } = await supabase.from('videos').insert(insert).select('*').single();
        if (error || !data) throw error;
        return mapVideo(data as VideoRow);
      },
      approve: async (id: string) => {
        const { data, error } = await supabase.from('videos').update({ status: 'APPROVED', validated_at: new Date().toISOString() }).eq('id', id).select('*').single();
        if (error || !data) return null;
        return mapVideo(data as VideoRow);
      },
      reject: async (id: string) => {
        const { data, error } = await supabase.from('videos').update({ status: 'REJECTED', validated_at: new Date().toISOString() }).eq('id', id).select('*').single();
        if (error || !data) return null;
        return mapVideo(data as VideoRow);
      },
    },
    payment: {
      listForUser: async (user: AuthUserRecord | null) => {
        if (!user) return [];
        let query = supabase.from('payments').select('*');
        if (user.role !== 'admin') query = query.eq('clipador_id', user.id);
        const { data, error } = await query;
        if (error || !data) return [];
        return (data as PaymentRow[]).map(mapPayment);
      },
      request: async (user: AuthUserRecord, amount: number) => {
        const insert = { clipador_id: user.id, amount };
        const { data, error } = await supabase.from('payments').insert(insert).select('*').single();
        if (error || !data) throw error;
        return mapPayment(data as PaymentRow);
      },
      markProcessed: async (id: string) => {
        const { data, error } = await supabase.from('payments').update({ status: 'PROCESSED', processed_at: new Date().toISOString() }).eq('id', id).select('*').single();
        if (error || !data) return null;
        return mapPayment(data as PaymentRow);
      },
    },
    competition: {
      list: async () => {
        const { data, error } = await supabase.from('competitions').select('*');
        if (error || !data) return [];
  const rewardsResp = await supabase.from('competition_rewards').select('*');
        const rewardsByCompetition = new Map<string, CompetitionRewardRow[]>();
        if (!rewardsResp.error && rewardsResp.data) {
          (rewardsResp.data as CompetitionRewardRow[]).forEach(r => {
            const arr = rewardsByCompetition.get(r.competition_id) || [];
            arr.push(r);
            rewardsByCompetition.set(r.competition_id, arr);
          });
        }
        return (data as CompetitionRow[]).map(c => mapCompetition(c, rewardsByCompetition.get(c.id) || []));
      },
      listEnrolledForUser: async (clipadorId: string) => {
        // competições em que o usuário está inscrito (todas as datas)
        const { data, error } = await supabase
          .from('competition_participants')
          .select('competition_id, competitions(*)')
          .eq('clipador_id', clipadorId);
        if (error || !data) return [];
        const comps: CompetitionRow[] = (data as any[])
          .map((row) => row.competitions)
          .filter(Boolean);
        // buscar prêmios de todas
        const ids = comps.map(c => c.id);
  const rewardsResp = ids.length ? await supabase.from('competition_rewards').select('*').in('competition_id', ids) : { data: [], error: null } as any;
        const rewardsByCompetition = new Map<string, CompetitionRewardRow[]>();
        if (!rewardsResp.error && rewardsResp.data) {
          (rewardsResp.data as CompetitionRewardRow[]).forEach(r => {
            const arr = rewardsByCompetition.get(r.competition_id) || [];
            arr.push(r);
            rewardsByCompetition.set(r.competition_id, arr);
          });
        }
        return comps.map(c => mapCompetition(c, rewardsByCompetition.get(c.id) || []));
      },
      isUserEnrolled: async (clipadorId: string, competitionId: string) => {
        const { data, error } = await supabase
          .from('competition_participants')
          .select('competition_id')
          .eq('clipador_id', clipadorId)
          .eq('competition_id', competitionId)
          .maybeSingle();
        return !!(data && !error);
      },
      getById: async (id: string) => {
        const { data, error } = await supabase.from('competitions').select('*').eq('id', id).single();
        if (error || !data) return null;
        const rewards = await supabase.from('competition_rewards').select('*').eq('competition_id', id);
        return mapCompetition(data as CompetitionRow, (rewards.data as CompetitionRewardRow[]) || []);
      },
      create: async (payload: Omit<Competition, 'id' | 'isActive' | 'status'> & { isActive?: boolean; status?: Competition['status'] }) => {
        const now = Date.now();
        const status: Competition['status'] = payload.status
          ? payload.status
          : (now < new Date(payload.startDate).getTime() ? 'SCHEDULED' : (now > new Date(payload.endDate).getTime() ? 'COMPLETED' : 'ACTIVE'));
        const insert = {
          name: payload.name,
            description: payload.description ?? null,
          banner_image_url: payload.bannerImageUrl ?? null,
          start_date: payload.startDate.toISOString().slice(0,10),
          end_date: payload.endDate.toISOString().slice(0,10),
          is_active: payload.isActive ?? true,
          status,
          allowed_platforms: payload.rules?.allowedPlatforms ?? ['tiktok','instagram','kwai'],
        };
        const { data, error } = await supabase.from('competitions').insert(insert).select('*').single();
        if (error || !data) throw error;
        const comp = data as CompetitionRow;
        if (payload.rewards?.length) {
          const rewardsInsert = payload.rewards.map((r: any) => ({
            competition_id: comp.id,
            from_place: r.fromPlace,
            to_place: r.toPlace,
            amount: r.amount,
            platform: r.platform ?? null,
            description: r.description ?? null,
          }));
          await supabase.from('competition_rewards').insert(rewardsInsert);
        }
        const rewards = await supabase.from('competition_rewards').select('*').eq('competition_id', comp.id);
        return mapCompetition(comp, (rewards.data as CompetitionRewardRow[]) || []);
      },
      patch: async (id: string, data: Partial<Pick<Competition, 'name' | 'startDate' | 'endDate' | 'isActive' | 'rules'>>) => {
        const update: any = {};
        if (data.name) update.name = data.name;
        if (data.startDate) update.start_date = data.startDate.toISOString().slice(0,10);
        if (data.endDate) update.end_date = data.endDate.toISOString().slice(0,10);
        if (data.isActive !== undefined) update.is_active = data.isActive;
  if (data.rules?.allowedPlatforms) update.allowed_platforms = data.rules.allowedPlatforms;
        if (Object.keys(update).length === 0) return null;
        const { data: updated, error } = await supabase.from('competitions').update(update).eq('id', id).select('*').single();
        if (error || !updated) return null;
        const rewards = await supabase.from('competition_rewards').select('*').eq('competition_id', id);
        return mapCompetition(updated as CompetitionRow, (rewards.data as CompetitionRewardRow[]) || []);
      },
      remove: async (id: string) => {
        const { error } = await supabase.from('competitions').delete().eq('id', id);
        return !error;
      },
      enroll: async (clipadorId: string, competitionId: string) => {
        // Upsert para evitar erro de PK
        const { error } = await supabase
          .from('competition_participants')
          .upsert({ clipador_id: clipadorId, competition_id: competitionId }, { onConflict: 'competition_id,clipador_id' });
        return !error;
      }
    },
    admin: {
      listClipadores: async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'clipador');
        if (error || !data) return [];
        return (data as ProfileRow[]).map(mapProfile);
      },
      toggleClipadorActive: async (id: string) => {
        const { data, error } = await supabase.from('profiles').select('is_active').eq('id', id).single();
        if (error || !data) return null;
        const next = !(data as any).is_active;
        const updated = await supabase.from('profiles').update({ is_active: next }).eq('id', id).select('*').single();
        if (updated.error || !updated.data) return null;
        const mapped = mapProfile(updated.data as ProfileRow);
        return mapped.clipador!;
      },
      addWarning: async (id: string) => {
        const { data, error } = await supabase.rpc('increment_warning', { user_id: id });
        if (!error && data) return data as number;
        // fallback manual
        const current = await supabase.from('profiles').select('warnings').eq('id', id).single();
        if (current.error || !current.data) return null;
        const warnings = (current.data as any).warnings + 1;
        const updated = await supabase.from('profiles').update({ warnings }).eq('id', id).select('warnings').single();
        if (updated.error || !updated.data) return null;
        return (updated.data as any).warnings as number;
      }
    }
  };
}
