import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { config } from '@/lib/config';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function AdminClipadoresPage() {
  const session: any = await getServerSession(authOptions as any);
  if (!session?.user) redirect(config.urls.login);
  if ((session.user as any).role !== 'admin') redirect(config.urls.userDashboard);

  const users = await db.admin.listClipadores();

  return (
      <Card>
        <CardHeader>Gerenciar Clipadores</CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-sm sm:text-[0.95rem]">
              <thead className="bg-gradient-to-r from-slate-950 via-emerald-900/10 to-slate-950">
                <tr>
                  {['Usuário','Email','Status','Avisos','Ações'].map((h) => (
                    <th key={h} className="px-3 sm:px-4 py-2.5 sm:py-3 text-left font-semibold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {users.map((u: any) => (
                  <tr key={u.id} className="group hover:bg-slate-900">
                    <td className="px-3 sm:px-4 py-2 text-slate-100">{u.username}</td>
                    <td className="px-3 sm:px-4 py-2 text-slate-300">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.clipador?.isActive ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                        {u.clipador?.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-slate-100">{u.clipador?.warnings ?? 0}</td>
                    <td className="px-3 sm:px-4 py-2 flex flex-wrap gap-2">
                      <form action={async () => { 'use server'; await db.admin.toggleClipadorActive(u.id); }}>
                        <Button size="sm" variant="outline">{u.clipador?.isActive ? 'Desativar' : 'Ativar'}</Button>
                      </form>
                      <form action={async () => { 'use server'; await db.admin.addWarning(u.id); }}>
                        <Button size="sm" variant="outline">+ Aviso</Button>
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