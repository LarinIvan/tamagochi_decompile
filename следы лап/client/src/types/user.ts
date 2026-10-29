export type FactionId = 'sprinters' | 'guardians' | 'free';

export interface FactionInfo {
  id: FactionId;
  name: string;
  symbol: string;
  color: string;
  borderColor: string;
  bonusTitle: string;
  bonusDesc: string;
}

export const FACTIONS: Record<FactionId, FactionInfo> = {
  sprinters: {
    id: 'sprinters',
    name: 'Лига Спринтеров',
    symbol: '🐾',
    color: 'rgba(59, 130, 246, 0.45)', // Blue
    borderColor: '#3B82F6',
    bonusTitle: 'Ловкие лапки',
    bonusDesc: 'Быстрый захват сот (-15% требуемой дистанции)'
  },
  guardians: {
    id: 'guardians',
    name: 'Орден Стражей',
    symbol: '🛡️',
    color: 'rgba(239, 68, 68, 0.45)', // Red
    borderColor: '#EF4444',
    bonusTitle: 'Крепкий рубеж',
    bonusDesc: 'Увеличенная прочность сот к вражеским атакам'
  },
  free: {
    id: 'free',
    name: 'Братство Вольных',
    symbol: '🌟',
    color: 'rgba(234, 179, 8, 0.45)', // Gold/Yellow
    borderColor: '#EAB308',
    bonusTitle: 'Следопыты',
    bonusDesc: '+20% косточек и повышенный радиус радара'
  }
};

export type LeashColor = 'green' | 'yellow' | 'red' | 'stealth';

export interface LeashInfo {
  color: LeashColor;
  label: string;
  badge: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

export const LEASH_COLORS: Record<LeashColor, LeashInfo> = {
  green: {
    color: 'green',
    label: 'Ищем друзей',
    badge: '🟢 Дружелюбный',
    description: 'Обожает играть и знакомиться с сородичами',
    bgColor: '#22c55e',
    borderColor: '#15803d'
  },
  yellow: {
    color: 'yellow',
    label: 'Держим дистанцию',
    badge: '🟡 На поводке',
    description: 'В процессе дрессировки или робкий, не подходите резко',
    bgColor: '#eab308',
    borderColor: '#a16207'
  },
  red: {
    color: 'red',
    label: 'Не подходить',
    badge: '🔴 Осторожно',
    description: 'Течка, болезнь или реактивность к другим собакам',
    bgColor: '#ef4444',
    borderColor: '#b91c1c'
  },
  stealth: {
    color: 'stealth',
    label: 'Режим невидимки',
    badge: '👻 Стелс',
    description: 'Скрывать точку на карте (только захват сот)',
    bgColor: '#64748b',
    borderColor: '#334155'
  }
};

export type PawMarkerStyle = 'classic' | 'corgi' | 'shepherd' | 'spitz' | 'husky' | 'crown' | 'bone' | 'fire' | 'neon';

export interface MarkerStyleInfo {
  id: PawMarkerStyle;
  name: string;
  icon: string;
  color: string;
}

export const MARKER_STYLES: MarkerStyleInfo[] = [
  { id: 'classic', name: 'Лапка', icon: '🐾', color: '#38bdf8' },
  { id: 'corgi', name: 'Корги', icon: '🦊', color: '#fb923c' },
  { id: 'shepherd', name: 'Овчарка', icon: '🐺', color: '#a8a29e' },
  { id: 'spitz', name: 'Шпиц', icon: '🐻', color: '#fcd34d' },
  { id: 'husky', name: 'Хаски', icon: '🐶', color: '#67e8f9' },
  { id: 'crown', name: 'Корона', icon: '👑', color: '#facc15' },
  { id: 'bone', name: 'Сахарная кость', icon: '🦴', color: '#f8fafc' },
  { id: 'fire', name: 'Огненный след', icon: '🔥', color: '#f97316' },
  { id: 'neon', name: 'Неоновый всплеск', icon: '⚡', color: '#c084fc' }
];

export interface Dog {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  isNeutered: boolean;
  ageYears: number;
  weightKg: number;
  avatarUrl: string;
  faction: FactionId;
  leashColor: LeashColor;
  markerStyle: PawMarkerStyle;
  habits: string[];
  totalKm: number;
  totalHexes: number;
  rank: string;
  level: number;
  exp: number;
  sugarBones: number;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  bio: string;
  district: string;
  avatarUrl: string;
  karma: number;
  dogs: Dog[];
  selectedDogId: string;
}
