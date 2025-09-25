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
  cpm: string; // numeric
  allowed_platforms: string[];
  created_at: string;
}

interface CompetitionRewardRow {
  id: string;
  competition_id: string;
  place: number;
  amount: string;
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
  rules: { cpm: Number(c.cpm), allowedPlatforms: c.allowed_platforms as ('tiktok' | 'instagram' | 'kwai')[] },
    rewards: rewards
      .sort((a, b) => a.place - b.place)
      .map(r => ({ place: r.place, amount: Number(r.amount) })),
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
          cpm: payload.rules?.cpm ?? 0,
          allowed_platforms: payload.rules?.allowedPlatforms ?? ['tiktok','instagram','kwai'],
        };
        const { data, error } = await supabase.from('competitions').insert(insert).select('*').single();
        if (error || !data) throw error;
        const comp = data as CompetitionRow;
        if (payload.rewards?.length) {
          const rewardsInsert = payload.rewards.map(r => ({ competition_id: comp.id, place: r.place, amount: r.amount }));
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
        if (data.rules?.cpm !== undefined) update.cpm = data.rules.cpm;
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
