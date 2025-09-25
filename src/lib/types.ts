// src/lib/types.ts

export enum VideoStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

export enum PaymentStatus {
  Pending = 'PENDING',
  Processed = 'PROCESSED',
  Failed = 'FAILED',
}

export interface Clipador {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  warnings: number;
  totalEarnings: number;
  pixKey?: string;
  createdAt: Date;
}

export interface Video {
  id: string;
  clipadorId: string;
  url: string;
  socialMedia: 'tiktok' | 'instagram' | 'kwai' | 'youtube';
  views: number;
  earnings: number;
  status: VideoStatus;
  submittedAt: Date;
  validatedAt?: Date;
  competitionId?: string; // campanha à qual o vídeo pertence (opcional)
}

export interface Payment {
  id: string;
  clipadorId: string;
  amount: number;
  status: PaymentStatus;
  requestedAt: Date;
  processedAt?: Date;
}

export interface CompetitionReward {
  fromPlace: number; // início do intervalo (ex: 1)
  toPlace: number;   // fim do intervalo (ex: 3)
  amount: number;    // valor por vencedor na faixa
  platform?: 'tiktok' | 'instagram' | 'kwai' | 'youtube'; // opcional: premiação específica por plataforma
  description?: string; // ex: bônus, brinde, etc.
}

export type CompetitionStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';

export interface Competition {
  id: string;
  name: string;
  description?: string;
  bannerImageUrl?: string; // URL pública da imagem (Cloudinary/S3/Netlify Storage)
  startDate: Date;
  endDate: Date;
  isActive: boolean; // controle manual para pausar/cancelar
  status?: CompetitionStatus; // redundante mas útil para filtros; pode ser derivado por datas
  rules: {
    minViews?: number; // opcional: visualizações mínimas para elegibilidade
    allowedPlatforms?: Array<'tiktok' | 'instagram' | 'kwai' | 'youtube'>; // redes válidas
    requiredHashtags?: string[]; // hashtags obrigatórias da campanha
    requiredMentions?: string[]; // @menções obrigatórias
  };
  rewards?: CompetitionReward[]; // premiação por colocação
  assets?: {
    audioLinks?: Array<{
      platform: 'tiktok' | 'instagram' | 'kwai' | 'youtube';
      url: string;
      label?: string; // ex: "Áudio oficial TikTok"
    }>;
  };
  phases?: Array<{
    name: string; // Ex: "Antecipação", "Campanha"
    startDate: Date;
    endDate: Date;
    description?: string;
  }>; // fases opcionais
}

export interface CompetitionParticipant {
  competitionId: string;
  clipadorId: string;
  joinedAt: Date;
}

export type SocialPlatform = 'tiktok' | 'instagram' | 'kwai' | 'youtube';
export type VerificationStatus = 'pending' | 'verified' | 'revoked';

export interface SocialAccount {
  id: string;
  clipadorId: string; // usuário EloX
  platform: SocialPlatform;
  username: string; // @perfil
  accessToken?: string; // armazenado apenas quando necessário (mock/in-memory)
  status: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Notificações (persistentes via Supabase)
export type NotificationType =
  | 'video_approved'
  | 'video_rejected'
  | 'payment_processed'
  | 'payment_failed';

export interface Notification {
  id: string;
  userId: string; // id do perfil/usuário
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: Date;
  readAt?: Date;
}
