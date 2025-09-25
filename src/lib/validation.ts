// Utilidades de validação e normalização

// Username: 3-20 chars, letras, números, underscore. Case-insensitive na lógica de negócio.
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export function validateUsername(u: string): boolean {
  return USERNAME_REGEX.test(u);
}
export function normalizeUsername(u: string): string {
  return u.trim().toLowerCase();
}

// PIX key pode ser: CPF, CNPJ, Email, Telefone (E.164 simplificado) ou Chave Aleatória UUID v4
// CPF: 11 dígitos
const CPF_REGEX = /^\d{11}$/;
// CNPJ: 14 dígitos
const CNPJ_REGEX = /^\d{14}$/;
// Email simples (não exaustivo)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Telefone internacional + dígitos (mín 10, máx 15) ex: +5511999998888
const PHONE_REGEX = /^\+[1-9]\d{9,14}$/;
// Chave aleatória PIX (UUID v4)
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'uuid' | 'unknown';

export function detectPixKeyType(value: string): PixKeyType {
  if (CPF_REGEX.test(value)) return 'cpf';
  if (CNPJ_REGEX.test(value)) return 'cnpj';
  if (EMAIL_REGEX.test(value)) return 'email';
  if (PHONE_REGEX.test(value)) return 'phone';
  if (UUID_V4_REGEX.test(value)) return 'uuid';
  return 'unknown';
}

export function validatePixKey(value: string | undefined | null): boolean {
  if (!value) return true; // opcional
  return detectPixKeyType(value) !== 'unknown';
}

export function sanitizePixKey(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return validatePixKey(trimmed) ? trimmed : undefined;
}

// ===== Vídeo: validação de URL e detecção de plataforma =====

export type SocialPlatform = 'tiktok' | 'instagram' | 'kwai';

const PLATFORM_HOSTS: Record<SocialPlatform, string[]> = {
  tiktok: ['tiktok.com', 'vm.tiktok.com', 'm.tiktok.com'],
  instagram: ['instagram.com', 'www.instagram.com'],
  kwai: ['kwai.com', 'www.kwai.com', 's.kwai.app'],
};

export function detectSocialMediaFromUrl(raw: string): SocialPlatform | null {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.toLowerCase();
    for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS) as [SocialPlatform, string[]][]) {
      if (hosts.some(h => host === h || host.endsWith('.' + h))) return platform;
    }
    return null;
  } catch {
    return null;
  }
}

// Remove parâmetros de rastreamento comuns e normaliza espaços
export function normalizeVideoUrl(raw: string): string {
  try {
    const trimmed = raw.trim();
    const u = new URL(trimmed);
    // remove params de tracking comuns
    const trackingParams = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','igshid'];
    trackingParams.forEach(p => u.searchParams.delete(p));
    // Normaliza trailing slash para alguns padrões (mantém path e search)
    const normalized = u.toString();
    return normalized;
  } catch {
    return raw.trim();
  }
}

export function validateVideoUrl(raw: string, expectedPlatform?: SocialPlatform): { ok: boolean; reason?: string; platform?: SocialPlatform; url: string } {
  const url = normalizeVideoUrl(raw);
  let platform = detectSocialMediaFromUrl(url);
  if (!platform) {
    return { ok: false, reason: 'URL inválida ou plataforma não suportada', url };
  }
  if (expectedPlatform && platform !== expectedPlatform) {
    return { ok: false, reason: 'A URL não corresponde à rede social selecionada', platform, url };
  }
  // Valida caminhos mínimos por plataforma (heurísticas leves)
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    if (platform === 'tiktok') {
      // exemplos: /@user/video/123, /t/ZTxxxx
      if (!path.includes('/video/') && !path.startsWith('/t/')) return { ok: true, platform, url }; // aceitar curto (redirect vm.tiktok)
    }
    if (platform === 'instagram') {
      // exemplos: /reel/{id}, /reels/{id}, /p/{id}
      if (!path.startsWith('/reel/') && !path.startsWith('/reels/') && !path.startsWith('/p/')) {
        return { ok: false, reason: 'Link do Instagram deve ser de post/reel', platform, url };
      }
    }
    if (platform === 'kwai') {
      // aceitar domínios de compartilhamento
      // sem regra rígida
    }
  } catch {
    return { ok: false, reason: 'URL inválida', url };
  }
  return { ok: true, platform, url };
}

