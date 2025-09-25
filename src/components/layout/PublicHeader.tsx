import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import PublicHeaderClient from './PublicHeaderClient';

export default async function PublicHeader() {
  const session: any = await getServerSession(authOptions as any);
  const isLogged = !!session?.user;

  return (
    <PublicHeaderClient isLogged={isLogged} />
  );
}
