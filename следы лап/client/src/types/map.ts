import { FactionId } from './user';

export type BaseMapProvider = 'yandex' | '2gis' | 'google_map' | 'google_satellite' | 'osm' | 'carto_dark';

export interface BaseMapLayerInfo {
  id: BaseMapProvider;
  name: string;
  icon: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
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
  '2gis': {
    id: '2gis',
    name: '2GIS Карта',
    icon: '🟢',
    url: 'https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}',
    attribution: '&copy; 2GIS',
    maxZoom: 19,
    subdomains: ['0', '1', '2', '3']
  },
  yandex: {
    id: 'yandex',
    name: 'Яндекс.Карты',
    icon: '🔴',
    url: 'https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
    attribution: '&copy; Яндекс',
    maxZoom: 19,
  },
  google_map: {
    id: 'google_map',
    name: 'Google Maps (Схема)',
    icon: '🗺️',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  google_satellite: {
    id: 'google_satellite',
    name: 'Google Спутник',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Earth',
    maxZoom: 20,
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
