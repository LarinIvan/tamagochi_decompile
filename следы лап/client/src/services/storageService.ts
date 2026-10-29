import { UserProfile, Dog } from '../types/user';
import { HexCell, BaseMapProvider, Coordinates } from '../types/map';
import { HazardMarker, SosAlert } from '../types/safety';
import { coordToH3, getNeighborH3Cells } from './h3Engine';

const STORAGE_KEYS = {
  USER_PROFILE: 'sledy_lap_user_profile_v1',
  BASE_MAP: 'sledy_lap_base_map_v1',
  HEX_CELLS: 'sledy_lap_hex_cells_v1',
  HAZARDS: 'sledy_lap_hazards_v1',
  SOS_ALERTS: 'sledy_lap_sos_v1',
  LAST_COORDS: 'sledy_lap_last_coords_v1',
};

// Стартовые координаты по умолчанию: Центр (Парк Горького / Музеон)
export const DEFAULT_COORDS: Coordinates = {
  lat: 55.7315,
  lng: 37.6035
};

const INITIAL_DOGS: Dog[] = [
  {
    id: 'dog_corgi_1',
    name: 'Тоби',
    breed: 'Вельш-корги пемброк',
    gender: 'male',
    isNeutered: true,
    ageYears: 2,
    weightKg: 11.5,
    avatarUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
    faction: 'sprinters',
    leashColor: 'green',
    markerStyle: 'corgi',
    habits: ['Любит догонялки', 'Ищет друзей для игр', 'Пищевик', 'Знает трюки'],
    totalKm: 14.8,
    totalHexes: 38,
    rank: 'Хозяин сквера',
    level: 3,
    exp: 240,
    sugarBones: 185
  },
  {
    id: 'dog_staff_2',
    name: 'Зевс',
    breed: 'Американский стаффордширский терьер',
    gender: 'male',
    isNeutered: false,
    ageYears: 4,
    weightKg: 29.0,
    avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
    faction: 'guardians',
    leashColor: 'red',
    markerStyle: 'shepherd',
    habits: ['Держим дистанцию', 'Охраняет хозяина', 'Зооагрессия к кобелям', 'В наморднике'],
    totalKm: 32.4,
    totalHexes: 74,
    rank: 'Гроза бульваров',
    level: 5,
    exp: 610,
    sugarBones: 420
  }
];

const INITIAL_PROFILE: UserProfile = {
  id: 'user_alexey_main',
  name: 'Алексей Смирнов',
  nickname: 'CorgiCommander',
  bio: 'Гуляем с Тоби утром в 7:30 и вечером в 20:30. Всегда рады дружелюбным собакам до 15 кг!',
  district: 'Якиманка / Парк Горького',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  karma: 105,
  dogs: INITIAL_DOGS,
  selectedDogId: 'dog_corgi_1'
};

export const StorageService = {
  getUserProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Ошибка чтения профиля:', e);
      }
    }
    this.saveUserProfile(INITIAL_PROFILE);
    return INITIAL_PROFILE;
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getBaseMap(): BaseMapProvider {
    return (localStorage.getItem(STORAGE_KEYS.BASE_MAP) as BaseMapProvider) || 'carto_dark';
  },

  saveBaseMap(provider: BaseMapProvider): void {
    localStorage.setItem(STORAGE_KEYS.BASE_MAP, provider);
  },

  getLastCoords(): Coordinates {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_COORDS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_COORDS;
  },

  saveLastCoords(coords: Coordinates): void {
    localStorage.setItem(STORAGE_KEYS.LAST_COORDS, JSON.stringify(coords));
  },

  getHexCells(): Record<string, HexCell> {
    const data = localStorage.getItem(STORAGE_KEYS.HEX_CELLS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Ошибка чтения сот:', e);
      }
    }
    // Генерация стартового паттерна сот вокруг базовых координат
    const initialHexes: Record<string, HexCell> = {};
    const centerHex = coordToH3(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
    const neighbors = getNeighborH3Cells(centerHex, 2);

    neighbors.forEach((hex, idx) => {
      if (idx % 3 === 0) {
        initialHexes[hex] = {
          h3Index: hex,
          faction: 'sprinters',
          ownerDogId: 'dog_corgi_1',
          ownerDogName: 'Тоби (Корги)',
          scentPoints: 120,
          isFortified: false,
          lastVisitedAt: Date.now() - 3600000
        };
      } else if (idx % 3 === 1) {
        initialHexes[hex] = {
          h3Index: hex,
          faction: 'guardians',
          ownerDogId: 'bot_staff_1',
          ownerDogName: 'Барон (Ротвейлер)',
          scentPoints: 180,
          isFortified: true,
          lastVisitedAt: Date.now() - 7200000
        };
      } else {
        initialHexes[hex] = {
          h3Index: hex,
          faction: 'free',
          ownerDogId: 'bot_husky_1',
          ownerDogName: 'Скай (Хаски)',
          scentPoints: 90,
          isFortified: false,
          lastVisitedAt: Date.now() - 14400000
        };
      }
    });

    this.saveHexCells(initialHexes);
    return initialHexes;
  },

  saveHexCells(hexes: Record<string, HexCell>): void {
    localStorage.setItem(STORAGE_KEYS.HEX_CELLS, JSON.stringify(hexes));
  },

  getHazards(): HazardMarker[] {
    const data = localStorage.getItem(STORAGE_KEYS.HAZARDS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Ошибка чтения меток:', e);
      }
    }
    const initialHazards: HazardMarker[] = [
      {
        id: 'hazard_1',
        authorId: 'user_neighbor_1',
        authorName: 'Елена (Хозяйка Луны)',
        type: 'glass',
        lat: DEFAULT_COORDS.lat + 0.0012,
        lng: DEFAULT_COORDS.lng + 0.0018,
        description: 'Возле лавочки разбили бутылку, осколки в траве!',
        upvotes: 4,
        downvotes: 0,
        createdAt: Date.now() - 1800000,
        expiresAt: Date.now() + 86400000 * 3
      },
      {
        id: 'hazard_2',
        authorId: 'user_neighbor_2',
        authorName: 'Михаил',
        type: 'reagent',
        lat: DEFAULT_COORDS.lat - 0.0015,
        lng: DEFAULT_COORDS.lng - 0.0012,
        description: 'Рассыпали белый гранулированный реагент, лапы жжет сразу!',
        upvotes: 7,
        downvotes: 0,
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() + 86400000 * 2
      }
    ];
    this.saveHazards(initialHazards);
    return initialHazards;
  },

  saveHazards(hazards: HazardMarker[]): void {
    localStorage.setItem(STORAGE_KEYS.HAZARDS, JSON.stringify(hazards));
  },

  getSosAlerts(): SosAlert[] {
    const data = localStorage.getItem(STORAGE_KEYS.SOS_ALERTS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        // fallback
      }
    }
    return [];
  },

  saveSosAlerts(alerts: SosAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(alerts));
  }
};
