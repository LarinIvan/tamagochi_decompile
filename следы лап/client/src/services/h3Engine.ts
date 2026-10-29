import * as h3 from 'h3-js';

export const H3_RESOLUTION = 10; // ~66м грань, ~114-130м диаметр

/**
 * Получить H3 индекс ячейки по координатам
 */
export function coordToH3(lat: number, lng: number, resolution = H3_RESOLUTION): string {
  return h3.latLngToCell(lat, lng, resolution);
}

/**
 * Получить координаты вершин гексагона для отрисовки в Leaflet: [[lat, lng], ...]
 */
export function getH3Boundary(h3Index: string): [number, number][] {
  try {
    return h3.cellToBoundary(h3Index);
  } catch (e) {
    console.error('Ошибка cellToBoundary для', h3Index, e);
    return [];
  }
}

/**
 * Получить центр гексагона [lat, lng]
 */
export function getH3Center(h3Index: string): [number, number] {
  return h3.cellToLatLng(h3Index);
}

/**
 * Получить соседние гексагоны (диск k-ring)
 */
export function getNeighborH3Cells(h3Index: string, k = 1): string[] {
  try {
    return h3.gridDisk(h3Index, k);
  } catch (e) {
    console.error('Ошибка gridDisk для', h3Index, e);
    return [h3Index];
  }
}

/**
 * Найти ячейки H3, оказавшиеся внутри замкнутого полигона
 */
export function getEnclosedH3Cells(polygonCoords: [number, number][], resolution = H3_RESOLUTION): string[] {
  if (polygonCoords.length < 3) return [];
  try {
    // Замыкаем кольцо если не замкнуто
    const ring = [...polygonCoords];
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]]);
    }
    return h3.polygonToCells(ring, resolution);
  } catch (e) {
    console.error('Ошибка polygonToCells:', e);
    return [];
  }
}

/**
 * Формула гаверсинусов: точное расстояние в метрах между двумя координатами
 */
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // радиус Земли в метрах
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
