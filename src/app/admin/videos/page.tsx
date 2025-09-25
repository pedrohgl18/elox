import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Video } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { revalidatePath } from 'next/cache';
import { Input } from '@/components/ui/Input';

export default async function AdminVideosPage({ searchParams }: { searchParams?: { status?: string; social?: string; q?: string; page?: string; pageSize?: string; sort?: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  const videos: Video[] = await db.video.listForUser({ role: 'admin' } as any);
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
    return okStatus && okSocial && okSearch;
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

  return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Moderação de Vídeos</h2>
            <form className="flex items-end gap-2" method="get">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <Select name="status" defaultValue={searchParams?.status || ''}>
                  <option value="">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="APPROVED">Aprovado</option>
                  <option value="REJECTED">Rejeitado</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rede</label>
                <Select name="social" defaultValue={searchParams?.social || ''}>
                  <option value="">Todas</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="kwai">Kwai</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Buscar (usuário/email)</label>
                <Input name="q" placeholder="ex: clip_user ou user@" defaultValue={searchParams?.q || ''} />
              </div>
              <input type="hidden" name="sort" value={searchParams?.sort || 'recent'} />
              <input type="hidden" name="page" value={String(currentPage)} />
              <input type="hidden" name="pageSize" value={String(pageSize)} />
              <Button type="submit" size="sm">Filtrar</Button>
              <a href="/admin/videos"><Button type="button" variant="outline" size="sm">Limpar</Button></a>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-gradient-to-r from-slate-950 via-emerald-900/10 to-slate-950">
                <tr>
                  {['Clipador','Rede','URL','Enviado em','Validado em','Status','Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {pageItems.map(({ v, c }) => (
                  <tr key={v.id} className="group hover:bg-slate-900">
                    <td className="px-4 py-2 text-slate-100">
                      <div className="flex flex-col">
                        <span className="font-medium">{c.username}</span>
                        <span className="text-xs text-slate-400">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{v.socialMedia.toUpperCase()}</td>
                    <td className="px-4 py-2"><a href={v.url} target="_blank" rel="noreferrer" className="text-brand-400 underline break-all">{v.url}</a></td>
                    <td className="px-4 py-2 text-slate-300">{new Date(v.submittedAt).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-2 text-slate-300">{v.validatedAt ? new Date(v.validatedAt).toLocaleString('pt-BR') : '-'}</td>
                    <td className="px-4 py-2"><StatusBadge label={v.status} /></td>
                    <td className="px-4 py-2 flex gap-2">
                      {v.status !== 'APPROVED' && (
                        <form action={async () => { 'use server'; await db.video.approve(v.id); revalidatePath('/admin/videos'); }}>
                          <Button size="sm">Aprovar</Button>
                        </form>
                      )}
                      {v.status !== 'REJECTED' && (
                        <form action={async () => { 'use server'; await db.video.reject(v.id); revalidatePath('/admin/videos'); }}>
                          <Button size="sm" variant="outline">Rejeitar</Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
            <div>
              Exibindo {Math.min(total, end) - start} de {total} itens — Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <a href={`?${new URLSearchParams({ ...(searchParams as any), page: String(currentPage - 1), pageSize: String(pageSize) }).toString()}`}>
                  <Button size="sm" variant="outline">Anterior</Button>
                </a>
              )}
              {currentPage < totalPages && (
                <a href={`?${new URLSearchParams({ ...(searchParams as any), page: String(currentPage + 1), pageSize: String(pageSize) }).toString()}`}>
                  <Button size="sm" variant="outline">Próxima</Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  );
}