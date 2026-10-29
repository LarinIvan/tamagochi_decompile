export type HazardType = 'poison' | 'reagent' | 'glass' | 'hole' | 'pack' | 'firework';

export interface HazardConfig {
  type: HazardType;
  label: string;
  icon: string;
  color: string;
  alertRadiusMeters: number;
  ttlHours: number;
}

export const HAZARD_CONFIGS: Record<HazardType, HazardConfig> = {
  poison: {
    type: 'poison',
    label: 'Отрава / Догхантеры',
    icon: '☠️',
    color: '#991b1b',
    alertRadiusMeters: 70,
    ttlHours: 48
  },
  reagent: {
    type: 'reagent',
    label: 'Едкие химикаты / Реагент',
    icon: '🧪',
    color: '#9333ea',
    alertRadiusMeters: 40,
    ttlHours: 72
  },
  glass: {
    type: 'glass',
    label: 'Битое стекло / Острый мусор',
    icon: '🍾',
    color: '#ea580c',
    alertRadiusMeters: 30,
    ttlHours: 120
  },
  hole: {
    type: 'hole',
    label: 'Открытый люк / Опасная яма',
    icon: '🕳️',
    color: '#ca8a04',
    alertRadiusMeters: 30,
    ttlHours: 336
  },
  pack: {
    type: 'pack',
    label: 'Агрессивная стая собак',
    icon: '🐕‍🦺',
    color: '#dc2626',
    alertRadiusMeters: 100,
    ttlHours: 3
  },
  firework: {
    type: 'firework',
    label: 'Взрывы петард / Салюты',
    icon: '🎆',
    color: '#2563eb',
    alertRadiusMeters: 150,
    ttlHours: 2
  }
};

export interface HazardMarker {
  id: string;
  authorId: string;
  authorName: string;
  type: HazardType;
  lat: number;
  lng: number;
  description: string;
  photoUrl?: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  expiresAt: number;
}

export interface SosAlert {
  id: string;
  dogId: string;
  dogName: string;
  breed: string;
  avatarUrl: string;
  ownerName: string;
  ownerPhone: string;
  description: string;
  lat: number;
  lng: number;
  radiusKm: number;
  createdAt: number;
  isActive: boolean;
}
