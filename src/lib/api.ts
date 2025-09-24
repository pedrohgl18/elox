export type ApiError = { error: string };

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
  create: (payload: { url: string; socialMedia: 'tiktok' | 'instagram' | 'kwai' }) =>
    api('/api/videos', { method: 'POST', body: JSON.stringify(payload) }),
};

export const PaymentsAPI = {
  list: () => api<any[]>('/api/payments'),
  request: (amount: number) => api('/api/payments', { method: 'POST', body: JSON.stringify({ amount }) }),
};

export const CompetitionsAPI = {
  list: () => api<any[]>('/api/competitions'),
  create: (payload: any) => api('/api/competitions', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => api<any>(`/api/competitions/${id}`),
  patch: (id: string, payload: any) => api(`/api/competitions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
