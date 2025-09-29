import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Competition, Video } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { revalidatePath } from 'next/cache';
import { Input } from '@/components/ui/Input';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import ClientActions from './ClientActions';
import VideosTableClient, { VideoRow } from './VideosTableClient';

export default async function AdminVideosPage({ searchParams }: { searchParams?: { status?: string; social?: string; q?: string; page?: string; pageSize?: string; sort?: string; compId?: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  const videos: Video[] = await db.video.listForUser({ role: 'admin' } as any);
  const competitions: Competition[] = await db.competition.list();
  const activeComp = competitions.find(c => c.status === 'ACTIVE' || c.isActive);
  const selectedCompId = searchParams?.compId || activeComp?.id || '';
  // Tenta mapear info básica do clipador
  const clipadorCache = new Map<string, { username: string; email: string }>();
  async function getClipadorBasic(id: string) {
    if (clipadorCache.has(id)) return clipadorCache.get(id)!;
    const u = await db.auth.getById(id);
    const basic = { username: u?.username || id, email: u?.email || '' };
    clipadorCache.set(id, basic);
    return basic;
  }

  // Monta itens combinando dados do vídeo + básico do clipador
  const items = await Promise.all(
    videos.map(async (v: Video) => {
      const c = await getClipadorBasic(v.clipadorId);
      return { v, c };
    })
  );

  // filtros e busca
  const statusFilter = (searchParams?.status || '').toUpperCase();
  const socialFilter = (searchParams?.social || '').toLowerCase();
  const q = (searchParams?.q || '').toLowerCase().trim();
  let filtered = items.filter(({ v, c }) => {
    const okStatus = statusFilter ? v.status === statusFilter : true;
    const okSocial = socialFilter ? v.socialMedia === socialFilter : true;
    const okSearch = q ? (c.username.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || v.clipadorId.toLowerCase().includes(q)) : true;
    const okComp = selectedCompId ? (v.competitionId === selectedCompId) : true;
    return okStatus && okSocial && okSearch && okComp;
  });

  // ordenação por mais recente (submittedAt desc) por padrão
  const sort = (searchParams?.sort || 'recent').toLowerCase();
  if (sort === 'recent') {
    filtered = filtered.sort((a, b) => b.v.submittedAt.getTime() - a.v.submittedAt.getTime());
  }

  // paginação
  const pageSize = Math.max(1, Math.min(50, parseInt(searchParams?.pageSize || '10', 10) || 10));
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  // Busca últimas métricas coletadas no Supabase por URL (service role, server-side)
  const supa = getSupabaseServiceClient();
  const latestByUrl = new Map<string, { views: number | null; hashtags?: string[]; mentions?: string[]; collected_at?: string }>();
  if (supa && pageItems.length > 0) {
    const urls = pageItems.map(({ v }) => v.url);
    const { data: metrics } = await supa
      .from('video_metrics')
      .select('url,views,hashtags,mentions,collected_at')
      .in('url', urls)
      .order('collected_at', { ascending: false });
    if (Array.isArray(metrics)) {
      for (const m of metrics as any[]) {
        if (!latestByUrl.has(m.url)) latestByUrl.set(m.url, { views: m.views ?? null, hashtags: m.hashtags || [], mentions: m.mentions || [], collected_at: m.collected_at });
      }
    }
  }

  // Server actions para aprovar/rejeitar (passadas ao componente client)
  async function approveAction(id: string) { 'use server'; await db.video.approve(id); revalidatePath('/admin/videos'); }
  async function rejectAction(id: string) { 'use server'; await db.video.reject(id); revalidatePath('/admin/videos'); }

  // Prepara linhas para o componente client
  const rows: VideoRow[] = pageItems.map(({ v, c }) => ({
    id: v.id,
    clipadorUsername: c.username,
    clipadorEmail: c.email,
    socialMedia: v.socialMedia as any,
    url: v.url,
    status: v.status,
    submittedAt: v.submittedAt.toISOString(),
    validatedAt: v.validatedAt ? v.validatedAt.toISOString() : null,
    latest: (() => { const m = latestByUrl.get(v.url); return { views: m?.views ?? null, collected_at: m?.collected_at || null }; })(),
  }));

  return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Moderação de Vídeos</h2>
            <form className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-2 w-full sm:w-auto" method="get">
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-slate-400 mb-1">Competição</label>
                <Select name="compId" defaultValue={selectedCompId}>
                  <option value="">Todas</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <Select name="status" defaultValue={searchParams?.status || ''}>
                  <option value="">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="APPROVED">Aprovado</option>
                  <option value="REJECTED">Rejeitado</option>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-slate-400 mb-1">Rede</label>
                <Select name="social" defaultValue={searchParams?.social || ''}>
                  <option value="">Todas</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="kwai">Kwai</option>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-slate-400 mb-1">Buscar (usuário/email)</label>
                <Input name="q" placeholder="ex: clip_user ou user@" defaultValue={searchParams?.q || ''} />
              </div>
              <input type="hidden" name="sort" value={searchParams?.sort || 'recent'} />
              <input type="hidden" name="page" value={String(currentPage)} />
              <input type="hidden" name="pageSize" value={String(pageSize)} />
              <div className="flex gap-2">
                <Button type="submit" size="sm">Filtrar</Button>
                <a href="/admin/videos"><Button type="button" variant="outline" size="sm">Limpar</Button></a>
              </div>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <VideosTableClient rows={rows} approveAction={approveAction} rejectAction={rejectAction} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm text-slate-300">
            <div>
              Exibindo {Math.min(total, end) - start} de {total} itens — Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <a href={`?${new URLSearchParams({ ...(searchParams as any), compId: selectedCompId, page: String(currentPage - 1), pageSize: String(pageSize) }).toString()}`}>
                  <Button size="sm" variant="outline">Anterior</Button>
                </a>
              )}
              {currentPage < totalPages && (
                <a href={`?${new URLSearchParams({ ...(searchParams as any), compId: selectedCompId, page: String(currentPage + 1), pageSize: String(pageSize) }).toString()}`}>
                  <Button size="sm" variant="outline">Próxima</Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  );
}