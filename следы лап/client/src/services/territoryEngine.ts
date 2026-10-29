import { HexCell, WalkTrackPoint } from '../types/map';
import { Dog } from '../types/user';
import { getDistanceMeters, getEnclosedH3Cells } from './h3Engine';

export interface CaptureResult {
  updatedHexes: Record<string, HexCell>;
  isNewCapture: boolean;
  bonesEarned: number;
  message: string;
}

export interface LoopResult {
  updatedHexes: Record<string, HexCell>;
  enclosedCount: number;
  bonesEarned: number;
  message?: string;
}

export const TerritoryEngine = {
  /**
   * Зафиксировать визит собаки в гексагон
   */
  processHexVisit(
    h3Index: string,
    dog: Dog,
    hexes: Record<string, HexCell>
  ): CaptureResult {
    const updated = { ...hexes };
    const current = updated[h3Index];
    let isNewCapture = false;
    let bonesEarned = 0;
    let message = '';

    if (!current) {
      // Нейтральная сота -> захват
      updated[h3Index] = {
        h3Index,
        faction: dog.faction,
        ownerDogId: dog.id,
        ownerDogName: `${dog.name} (${dog.breed})`,
        scentPoints: 100,
        isFortified: false,
        lastVisitedAt: Date.now()
      };
      isNewCapture = true;
      bonesEarned = 10;
      message = `🐾 Новая сота захвачена! (+10 косточек)`;
    } else if (current.faction === dog.faction) {
      // Сота своей фракции -> укрепление
      const newSP = Math.min(300, current.scentPoints + 50);
      updated[h3Index] = {
        ...current,
        ownerDogId: dog.id,
        ownerDogName: `${dog.name} (${dog.breed})`,
        scentPoints: newSP,
        lastVisitedAt: Date.now()
      };
      bonesEarned = 3;
      message = `🛡️ Запах обновлен: ${newSP} SP`;
    } else {
      // Вражеская сота -> атака
      const remainingSP = current.scentPoints - 100;
      if (remainingSP <= 0) {
        // Перехват соты
        updated[h3Index] = {
          h3Index,
          faction: dog.faction,
          ownerDogId: dog.id,
          ownerDogName: `${dog.name} (${dog.breed})`,
          scentPoints: 80,
          isFortified: false,
          lastVisitedAt: Date.now()
        };
        isNewCapture = true;
        bonesEarned = 25;
        message = `⚔️ Вражеская сота отбита! (+25 косточек)`;
      } else {
        // Ослабление соты
        updated[h3Index] = {
          ...current,
          scentPoints: remainingSP,
          lastVisitedAt: Date.now()
        };
        bonesEarned = 5;
        message = `💥 Атака вражеской соты (-100 SP, осталось ${remainingSP} SP)`;
      }
    }

    return {
      updatedHexes: updated,
      isNewCapture,
      bonesEarned,
      message
    };
  },

  /**
   * Проверка замыкания контура (Loop Enclosure)
   */
  processLoopEnclosure(
    points: WalkTrackPoint[],
    dog: Dog,
    hexes: Record<string, HexCell>
  ): LoopResult {
    if (points.length < 8) {
      return { updatedHexes: hexes, enclosedCount: 0, bonesEarned: 0 };
    }

    const first = points[0];
    const last = points[points.length - 1];
    const distStartEnd = getDistanceMeters(first.lat, first.lng, last.lat, last.lng);

    // Замкнутость: старт и финиш ближе 60 метров
    if (distStartEnd > 60) {
      return { updatedHexes: hexes, enclosedCount: 0, bonesEarned: 0 };
    }

    const polygonCoords: [number, number][] = points.map((p) => [p.lat, p.lng]);
    const enclosedH3List = getEnclosedH3Cells(polygonCoords, 10);

    if (enclosedH3List.length === 0) {
      return { updatedHexes: hexes, enclosedCount: 0, bonesEarned: 0 };
    }

    // Защита от гигантских полигонов (не более 19 сот за раз)
    const validCells = enclosedH3List.slice(0, 19);
    const updated = { ...hexes };
    let newlyEnclosed = 0;

    validCells.forEach((hex) => {
      const existing = updated[hex];
      if (!existing || existing.faction !== dog.faction || !existing.isFortified) {
        newlyEnclosed++;
        updated[hex] = {
          h3Index: hex,
          faction: dog.faction,
          ownerDogId: dog.id,
          ownerDogName: `${dog.name} (${dog.breed})`,
          scentPoints: 250,
          isFortified: true,
          lastVisitedAt: Date.now()
        };
      }
    });

    if (newlyEnclosed > 0) {
      const bonusBones = newlyEnclosed * 20;
      return {
        updatedHexes: updated,
        enclosedCount: newlyEnclosed,
        bonesEarned: bonusBones,
        message: `🔄 Контур замкнут! Захвачено ${newlyEnclosed} сот внутри (+${bonusBones} косточек)!`
      };
    }

    return { updatedHexes: hexes, enclosedCount: 0, bonesEarned: 0 };
  },

  /**
   * Симуляция затухания влияния сот (суточный Decay)
   */
  decayHexes(hexes: Record<string, HexCell>): Record<string, HexCell> {
    const updated: Record<string, HexCell> = {};
    Object.entries(hexes).forEach(([hex, data]) => {
      const newSP = Math.floor(data.scentPoints * 0.67);
      if (newSP > 15) {
        updated[hex] = {
          ...data,
          scentPoints: newSP,
          isFortified: newSP > 200
        };
      }
      // Если SP <= 15, сота выветрилась и становится нейтральной (удаляется из владельцев)
    });
    return updated;
  }
};
