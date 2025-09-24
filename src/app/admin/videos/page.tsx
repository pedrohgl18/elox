import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default async function AdminVideosPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  const videos = await db.video.listForUser({ role: 'admin' } as any);

  return (
      <Card>
        <CardHeader>Moderação de Vídeos</CardHeader>
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
                {videos.map((v) => (
                  <tr key={v.id} className="group hover:bg-slate-900">
                    <td className="px-4 py-2 text-slate-100">{v.clipadorId}</td>
                    <td className="px-4 py-2 text-slate-300">{v.socialMedia.toUpperCase()}</td>
                    <td className="px-4 py-2"><a href={v.url} target="_blank" rel="noreferrer" className="text-brand-400 underline break-all">{v.url}</a></td>
                    <td className="px-4 py-2"><StatusBadge label={v.status} /></td>
                    <td className="px-4 py-2 flex gap-2">
                      <form action={async () => { 'use server'; await db.video.approve(v.id); }}>
                        <Button size="sm">Aprovar</Button>
                      </form>
                      <form action={async () => { 'use server'; await db.video.reject(v.id); }}>
                        <Button size="sm" variant="outline">Rejeitar</Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
  );
}