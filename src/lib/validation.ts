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
