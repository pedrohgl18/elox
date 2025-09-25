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

export default async function AdminVideosPage({ searchParams }: { searchParams?: { status?: string; social?: string } }) {
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

  // filtros
  const statusFilter = (searchParams?.status || '').toUpperCase();
  const socialFilter = (searchParams?.social || '').toLowerCase();
  const filtered = videos.filter(v => {
    const okStatus = statusFilter ? v.status === statusFilter : true;
    const okSocial = socialFilter ? v.socialMedia === socialFilter : true;
    return okStatus && okSocial;
  });

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
                  {['Clipador','Rede','URL','Status','Ações'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {await Promise.all(filtered.map(async (v: Video) => {
                  const c = await getClipadorBasic(v.clipadorId);
                  return (
                  <tr key={v.id} className="group hover:bg-slate-900">
                    <td className="px-4 py-2 text-slate-100">
                      <div className="flex flex-col">
                        <span className="font-medium">{c.username}</span>
                        <span className="text-xs text-slate-400">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-slate-300">{v.socialMedia.toUpperCase()}</td>
                    <td className="px-4 py-2"><a href={v.url} target="_blank" rel="noreferrer" className="text-brand-400 underline break-all">{v.url}</a></td>
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
                )}))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
  );
}