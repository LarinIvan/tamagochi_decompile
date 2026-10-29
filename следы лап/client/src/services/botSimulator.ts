import { BotDog } from '../types/simulation';
import { HexCell, Coordinates } from '../types/map';
import { HazardMarker } from '../types/safety';
import { coordToH3, getDistanceMeters } from './h3Engine';
import { TerritoryEngine } from './territoryEngine';
import { Dog } from '../types/user';

export const INITIAL_BOTS: BotDog[] = [
  {
    id: 'bot_baron_1',
    name: 'Барон',
    breed: 'Ротвейлер',
    gender: 'male',
    weightKg: 42,
    faction: 'guardians',
    leashColor: 'red',
    markerStyle: 'shepherd',
    avatarUrl: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&w=300&q=80',
    ownerName: 'Сергей (Орден Стражей)',
    habits: ['Держим дистанцию', 'Охраняет территорию', 'Крупный пес'],
    currentLat: 55.7335,
    currentLng: 37.6015,
    homeLat: 55.7335,
    homeLng: 37.6015,
    isWalking: true,
    speedKmh: 4.5
  },
  {
    id: 'bot_sky_2',
    name: 'Скай',
    breed: 'Сибирский хаски',
    gender: 'female',
    weightKg: 22,
    faction: 'free',
    leashColor: 'yellow',
    markerStyle: 'husky',
    avatarUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80',
    ownerName: 'Анна (Братство Вольных)',
    habits: ['Много бегает', 'Тянет поводок', 'Любит петь песни'],
    currentLat: 55.7295,
    currentLng: 37.6055,
    homeLat: 55.7295,
    homeLng: 37.6055,
    isWalking: true,
    speedKmh: 5.5
  },
  {
    id: 'bot_maya_3',
    name: 'Майя',
    breed: 'Джек-рассел терьер',
    gender: 'female',
    weightKg: 6.8,
    faction: 'sprinters',
    leashColor: 'green',
    markerStyle: 'corgi',
    avatarUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=300&q=80',
    ownerName: 'Мария (Лига Спринтеров)',
    habits: ['Ищет компанию', 'Бегает за мячом', 'Дружелюбная со всеми'],
    currentLat: 55.7328,
    currentLng: 37.6080,
    homeLat: 55.7328,
    homeLng: 37.6080,
    isWalking: true,
    speedKmh: 5.0
  },
  {
    id: 'bot_archie_4',
    name: 'Арчи',
    breed: 'Золотистый ретривер',
    gender: 'male',
    weightKg: 31,
    faction: 'free',
    leashColor: 'green',
    markerStyle: 'bone',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
    ownerName: 'Денис',
    habits: ['Обожает всех собак', 'Плавает в лужах', 'Несет палку'],
    currentLat: 55.7305,
    currentLng: 37.5990,
    homeLat: 55.7305,
    homeLng: 37.5990,
    isWalking: true,
    speedKmh: 4.2
  },
  {
    id: 'bot_businka_5',
    name: 'Бусинка',
    breed: 'Померанский шпиц',
    gender: 'female',
    weightKg: 3.2,
    faction: 'sprinters',
    leashColor: 'green',
    markerStyle: 'spitz',
    avatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80',
    ownerName: 'Ольга',
    habits: ['Маленькая и шустрая', 'Любит щенков', 'Носит жилетку'],
    currentLat: 55.7340,
    currentLng: 37.6050,
    homeLat: 55.7340,
    homeLng: 37.6050,
    isWalking: true,
    speedKmh: 4.0
  }
];

export const BotSimulator = {
  /**
   * Обновить позиции ботов за один временной шаг
   */
  updateBotsStep(
    bots: BotDog[],
    hexes: Record<string, HexCell>,
    deltaSeconds = 1.0,
    speedMultiplier = 1.0
  ): { updatedBots: BotDog[]; updatedHexes: Record<string, HexCell> } {
    let currentHexes = { ...hexes };

    const updatedBots = bots.map((bot) => {
      if (!bot.isWalking) return bot;

      // Если нет цели или достигли цели -> выбираем новую цель в радиусе 100-200м от дома
      let targetLat = bot.targetLat;
      let targetLng = bot.targetLng;

      if (!targetLat || !targetLng) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 0.001 + Math.random() * 0.002; // ~100-250 метров
        targetLat = bot.homeLat + Math.cos(angle) * radius;
        targetLng = bot.homeLng + Math.sin(angle) * radius;
      }

      const distToTarget = getDistanceMeters(bot.currentLat, bot.currentLng, targetLat, targetLng);

      if (distToTarget < 15) {
        // Достигли цели -> захватываем соту
        const cellId = coordToH3(bot.currentLat, bot.currentLng);
        const botAsDog: Dog = {
          id: bot.id,
          name: bot.name,
          breed: bot.breed,
          gender: bot.gender,
          isNeutered: true,
          ageYears: 3,
          weightKg: bot.weightKg,
          avatarUrl: bot.avatarUrl,
          faction: bot.faction,
          leashColor: bot.leashColor,
          markerStyle: bot.markerStyle,
          habits: bot.habits,
          totalKm: 10,
          totalHexes: 10,
          rank: 'Бот двора',
          level: 2,
          exp: 100,
          sugarBones: 50
        };

        const res = TerritoryEngine.processHexVisit(cellId, botAsDog, currentHexes);
        currentHexes = res.updatedHexes;

        // Выбираем новую цель
        const angle = Math.random() * 2 * Math.PI;
        const radius = 0.001 + Math.random() * 0.002;
        targetLat = bot.homeLat + Math.cos(angle) * radius;
        targetLng = bot.homeLng + Math.sin(angle) * radius;

        return {
          ...bot,
          targetLat,
          targetLng
        };
      }

      // Шаг перемещения в сторону цели
      const speedMs = (bot.speedKmh / 3.6) * speedMultiplier;
      const stepDistMeters = speedMs * deltaSeconds;
      const ratio = Math.min(1.0, stepDistMeters / distToTarget);

      const nextLat = bot.currentLat + (targetLat - bot.currentLat) * ratio;
      const nextLng = bot.currentLng + (targetLng - bot.currentLng) * ratio;

      return {
        ...bot,
        currentLat: nextLat,
        currentLng: nextLng,
        targetLat,
        targetLng
      };
    });

    return {
      updatedBots,
      updatedHexes: currentHexes
    };
  },

  /**
   * Сгенерировать случайную метку опасности рядом с игроком
   */
  spawnRandomHazardNear(playerCoords: Coordinates): HazardMarker {
    const types = ['glass', 'reagent', 'poison', 'hole'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    const angle = Math.random() * 2 * Math.PI;
    const offset = 0.0006 + Math.random() * 0.0008; // 60 - 100 метров

    const descriptions: Record<string, string> = {
      glass: 'Соседи заметили битую пивную бутылку на дорожке!',
      reagent: 'Здесь обильно рассыпан противогололедный реагент!',
      poison: 'Внимание: собачники сообщили о подозрительном корме с таблетками!',
      hole: 'Открыта крышка колодца теплотрассы!'
    };

    return {
      id: `hazard_spawn_${Date.now()}`,
      authorId: 'bot_neighbor_reporter',
      authorName: 'Сосед по району (Бот)',
      type: randomType,
      lat: playerCoords.lat + Math.cos(angle) * offset,
      lng: playerCoords.lng + Math.sin(angle) * offset,
      description: descriptions[randomType],
      upvotes: 3,
      downvotes: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000 * 2
    };
  }
};
