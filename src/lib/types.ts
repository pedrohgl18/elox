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
  socialMedia: 'tiktok' | 'instagram' | 'kwai';
  views: number;
  earnings: number;
  status: VideoStatus;
  submittedAt: Date;
  validatedAt?: Date;
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
  place: number; // 1 para campeão, 2, 3...
  amount: number; // valor em moeda local (centavos ou reais, conforme política)
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
    cpm: number; // Custo Por Mil visualizações
    minViews?: number; // opcional: visualizações mínimas para elegibilidade
    allowedPlatforms?: Array<'tiktok' | 'instagram' | 'kwai'>; // redes válidas
  };
  rewards?: CompetitionReward[]; // premiação por colocação
}
