import { FactionId } from './user';

export type BaseMapProvider =
  | 'yandex'
  | 'google_map'
  | 'google_hybrid'
  | 'google_satellite'
  | 'carto_voyager'
  | 'osm'
  | 'carto_dark';

export interface BaseMapLayerInfo {
  id: BaseMapProvider;
  name: string;
  icon: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  isYandex?: boolean;
}

export const MAP_PROVIDERS: Record<BaseMapProvider, BaseMapLayerInfo> = {
  carto_dark: {
    id: 'carto_dark',
    name: 'Ночной стиль (Carto Dark)',
    icon: '🌃',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  },
  yandex: {
    id: 'yandex',
    name: 'Яндекс.Карты (Схема)',
    icon: '🔴',
    url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
    attribution: '&copy; Яндекс',
    maxZoom: 19,
    isYandex: true
  },
  google_map: {
    id: 'google_map',
    name: 'Google Maps (Схема)',
    icon: '🗺️',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  google_hybrid: {
    id: 'google_hybrid',
    name: 'Google Спутник + Улицы',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Earth',
    maxZoom: 20,
  },
  google_satellite: {
    id: 'google_satellite',
    name: 'Google Чистый спутник',
    icon: '📷',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Earth',
    maxZoom: 20,
  },
  carto_voyager: {
    id: 'carto_voyager',
    name: 'Городской стиль (Voyager)',
    icon: '🏙️',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    icon: '🌍',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  }
};

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HexCell {
  h3Index: string;
  faction: FactionId;
  ownerDogId?: string;
  ownerDogName?: string;
  scentPoints: number; // 0 - 300
  isFortified: boolean;
  lastVisitedAt: number;
}

export interface WalkTrackPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ActiveWalk {
  isActive: boolean;
  startTime: number;
  distanceMeters: number;
  durationSeconds: number;
  hexesCaptured: string[];
  loopsEnclosed: number;
  points: WalkTrackPoint[];
  bonesEarned: number;
}
