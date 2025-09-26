export type ApiError = { error: string };
import type { SocialAccount } from '@/lib/types';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((msg as ApiError).error || res.statusText);
  }
  return res.json();
}

export const VideosAPI = {
  list: () => api<any[]>('/api/videos'),
  create: (payload: { url: string; socialMedia: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; competitionId?: string | null }) =>
    api('/api/videos', { method: 'POST', body: JSON.stringify(payload) }),
};

export const PaymentsAPI = {
  list: () => api<any[]>('/api/payments'),
  request: (amount: number) => api('/api/payments', { method: 'POST', body: JSON.stringify({ amount }) }),
};

export const CompetitionsAPI = {
  list: () => api<any[]>('/api/competitions'),
  listEnrolled: () => api<any[]>('/api/competitions/enrolled'),
  listEnrolledActive: () => api<any[]>('/api/competitions/enrolled-active'),
  create: (payload: any) => api('/api/competitions', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => api<any>(`/api/competitions/${id}`),
  patch: (id: string, payload: any) => api(`/api/competitions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const SocialAccountsAPI = {
  list: (): Promise<SocialAccount[]> => api<SocialAccount[]>('/api/social-accounts'),
  create: (payload: { platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; username: string }): Promise<SocialAccount> =>
    api<SocialAccount>('/api/social-accounts', { method: 'POST', body: JSON.stringify(payload) }),
  patch: (id: string, payload: { username?: string }): Promise<SocialAccount> =>
    api<SocialAccount>(`/api/social-accounts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id: string): Promise<{ success: boolean }> => api<{ success: boolean }>(`/api/social-accounts/${id}`, { method: 'DELETE' }),
  listPosts: (platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube', hashtag: string): Promise<{ platform: string; items: any[] }> =>
    api(`/api/social-accounts/posts?platform=${encodeURIComponent(platform)}&hashtag=${encodeURIComponent(hashtag)}`),
};
