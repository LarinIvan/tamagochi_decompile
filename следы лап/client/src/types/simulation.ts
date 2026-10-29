import { FactionId, LeashColor, PawMarkerStyle } from './user';
import { Coordinates } from './map';

export interface BotDog {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  weightKg: number;
  faction: FactionId;
  leashColor: LeashColor;
  markerStyle: PawMarkerStyle;
  avatarUrl: string;
  ownerName: string;
  habits: string[];
  currentLat: number;
  currentLng: number;
  homeLat: number;
  homeLng: number;
  targetLat?: number;
  targetLng?: number;
  isWalking: boolean;
  speedKmh: number;
  totalHexes?: number;
  totalKm?: number;
  rank?: string;
}

export interface DevModeSettings {
  isSimulating: boolean;
  speedMultiplier: number; // 1, 5, 20
  showH3Grid: boolean;
  showBots: boolean;
  isAutoEnclosing: boolean;
}
