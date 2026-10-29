import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Navigation2 } from 'lucide-react';
import { BaseMapProvider, Coordinates, HexCell, MAP_PROVIDERS, WalkTrackPoint } from '../../types/map';
import { Dog, FACTIONS, LEASH_COLORS, MARKER_STYLES } from '../../types/user';
import { BotDog } from '../../types/simulation';
import { HazardMarker, HAZARD_CONFIGS } from '../../types/safety';
import { getH3Boundary, coordToH3, getNeighborH3Cells } from '../../services/h3Engine';

// Кастомный слой тайлов для Яндекс.Карт с математической коррекцией эллипсоидальной проекции (EPSG:3395 -> EPSG:3857)
class YandexCorrectedTileLayer extends L.TileLayer {
  getTileUrl(coords: L.Coords): string {
    const z = this._getZoomForUrl();
    const x = coords.x;
    const ySpherical = coords.y;

    const n = Math.PI - (2 * Math.PI * ySpherical) / Math.pow(2, z);
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    const a = 6378137;
    const b = 6356752.3142;
    const e = Math.sqrt(1 - (b * b) / (a * a));
    const latRad = (lat * Math.PI) / 180;
    const sinPhi = Math.sin(latRad);
    const numTiles = Math.pow(2, z);

    const yYandex = Math.floor(
      ((1 -
        Math.log(
          Math.tan(Math.PI / 4 + latRad / 2) *
            Math.pow((1 - e * sinPhi) / (1 + e * sinPhi), e / 2)
        ) /
          Math.PI) /
        2) *
        numTiles
    );

    return `https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x=${x}&y=${yYandex}&z=${z}&scale=1&lang=ru_RU`;
  }
}

interface HexMapProps {
  currentProvider: BaseMapProvider;
  playerCoords: Coordinates;
  playerDog: Dog;
  hexCells: Record<string, HexCell>;
  bots: BotDog[];
  hazards: HazardMarker[];
  walkPoints: WalkTrackPoint[];
  isWalking: boolean;
  onMapClick: (coords: Coordinates) => void;
  onSelectDogCard: (dog: any) => void;
  onVoteHazard: (hazardId: string, isUp: boolean) => void;
}

export const HexMap: React.FC<HexMapProps> = ({
  currentProvider,
  playerCoords,
  playerDog,
  hexCells,
  bots,
  hazards,
  walkPoints,
  isWalking,
  onMapClick,
  onSelectDogCard,
  onVoteHazard
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Слой полигонов сот
  const hexLayerGroupRef = useRef<L.LayerGroup | null>(null);
  // Маркер игрока
  const playerMarkerRef = useRef<L.Marker | null>(null);
  // Слой ботов
  const botsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  // Слой меток безопасности
  const hazardsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  // Линия трека выгула
  const trackPolylineRef = useRef<L.Polyline | null>(null);

  // Авто-следование за собакой
  const [autoFollow, setAutoFollow] = useState(true);

  // 1. Инициализация карты
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [playerCoords.lat, playerCoords.lng],
      zoom: 17,
      minZoom: 12,
      maxZoom: 20,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // При ручном сдвиге карты пользователем временно отключаем авто-следование
    map.on('dragstart', () => {
      setAutoFollow(false);
    });

    hexLayerGroupRef.current = L.layerGroup().addTo(map);
    botsLayerGroupRef.current = L.layerGroup().addTo(map);
    hazardsLayerGroupRef.current = L.layerGroup().addTo(map);

    trackPolylineRef.current = L.polyline([], {
      color: '#38bdf8',
      weight: 5,
      dashArray: '4, 8',
      opacity: 0.85
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      if (playerMarkerRef.current) {
        playerMarkerRef.current.remove();
        playerMarkerRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Смена базового тайлового слоя карты (Яндекс, Google, OSM, Carto)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = MAP_PROVIDERS[currentProvider] || MAP_PROVIDERS.carto_dark;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newLayer: L.TileLayer;

    if (config.isYandex) {
      newLayer = new YandexCorrectedTileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom
      });
    } else {
      newLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
        subdomains: config.subdomains || ['a', 'b', 'c']
      });
    }

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [currentProvider]);

  // Текущий центральный H3 индекс для фоновой сотовой сетки
  const playerCenterHex = coordToH3(playerCoords.lat, playerCoords.lng);

  // 3. Обновление полигонов гексагонов Uber H3 (Нейтральная сетка + Захваченные соты)
  useEffect(() => {
    if (!hexLayerGroupRef.current) return;
    const group = hexLayerGroupRef.current;
    group.clearLayers();

    // 1. Отрисовка фоновой сетки нейтральных сот района (k-ring = 3 вокруг игрока)
    // Это создает ощущение цельного пчелиного улья/радара, где все ячейки ровно стыкуются друг с другом
    const nearbyGrid = getNeighborH3Cells(playerCenterHex, 3);
    nearbyGrid.forEach((h3Idx) => {
      // Если ячейка уже захвачена, пропускаем (её отрисует блок ниже с цветом фракции)
      if (hexCells[h3Idx]) return;

      const boundary = getH3Boundary(h3Idx);
      if (boundary.length === 0) return;

      const neutralPolygon = L.polygon(boundary, {
        color: '#64748b',
        weight: 1,
        fillColor: '#38bdf8',
        fillOpacity: 0.04,
        dashArray: '3, 6',
        lineJoin: 'round',
        lineCap: 'round'
      });

      neutralPolygon.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 160px;">
          <div style="font-weight: 800; font-size: 13px; color: #475569; margin-bottom: 2px;">
            ⚪ Свободная сота двора
          </div>
          <div style="color: #64748b; font-size: 11px;">Здесь ещё никто не пометил территорию.</div>
          <div style="font-size: 10px; color: #0284c7; font-weight: 700; margin-top: 6px;">
            🐾 Прогуляйтесь здесь с ${playerDog.name}, чтобы закрасить соту!
          </div>
        </div>
      `);

      group.addLayer(neutralPolygon);
    });

    // 2. Отрисовка захваченных сот фракций
    Object.values(hexCells).forEach((cell) => {
      const boundary = getH3Boundary(cell.h3Index);
      if (boundary.length === 0) return;

      const factionInfo = FACTIONS[cell.faction];
      const fillColor = factionInfo?.color || 'rgba(148, 163, 184, 0.2)';
      const borderColor = factionInfo?.borderColor || '#94a3b8';

      const polygon = L.polygon(boundary, {
        color: borderColor,
        weight: cell.isFortified ? 3.5 : 1.8,
        fillColor: fillColor,
        fillOpacity: cell.isFortified ? 0.65 : 0.38,
        dashArray: cell.isFortified ? undefined : '2, 4',
        lineJoin: 'round',
        lineCap: 'round'
      });

      const fortifiedBadge = cell.isFortified
        ? '<div style="color:#facc15; font-weight: bold; margin-top: 4px;">★ ЗАКРЫТЫЙ ДВОР (+100 SP броня)</div>'
        : '';

      polygon.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 160px;">
          <div style="font-weight: 800; font-size: 13px; color: ${borderColor}; margin-bottom: 2px;">
            ${factionInfo?.symbol} ${factionInfo?.name || 'Нейтральная сота'}
          </div>
          <div>Хозяин двора: <b>${cell.ownerDogName || 'Ничейная'}</b></div>
          <div>Запах (SP): <b>${cell.scentPoints} / 300</b></div>
          ${fortifiedBadge}
          <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
            Пройдите через соту, чтобы закрасить в цвет своей стаи!
          </div>
        </div>
      `);

      group.addLayer(polygon);
    });
  }, [hexCells, playerCenterHex, playerDog]);

  // 4. Обновление маркера игрока (КРАСИВАЯ АВАТАРКА ПИТОМЦА)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const leashInfo = LEASH_COLORS[playerDog.leashColor] || LEASH_COLORS.green;
    const factionInfo = FACTIONS[playerDog.faction] || FACTIONS.sprinters;
    const markerStyle = MARKER_STYLES.find((m) => m.id === playerDog.markerStyle) || MARKER_STYLES[0];

    // Крупная круглая фото-аватарка собаки с неоновым кольцом и кличкой
    const iconHtml = `
      <div class="relative flex flex-col items-center cursor-pointer select-none" style="width: 68px; height: 86px;">
        <!-- Пульсирующий ореол поводка -->
        <div class="absolute top-0 w-16 h-16 rounded-full marker-pulse pointer-events-none" style="background: ${leashInfo.bgColor}; opacity: 0.5; filter: blur(6px);"></div>
        
        <!-- Круглая рамка с фото собаки -->
        <div class="relative w-16 h-16 rounded-full p-1 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95" style="background: linear-gradient(135deg, ${factionInfo.borderColor}, ${leashInfo.bgColor}); box-shadow: 0 0 20px ${leashInfo.bgColor};">
          <div class="w-full h-full rounded-full overflow-hidden border-2 border-slate-900 bg-slate-950 flex items-center justify-center">
            <img 
              src="${playerDog.avatarUrl || ''}" 
              alt="${playerDog.name}" 
              class="w-full h-full object-cover" 
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background:#0f172a; color:#38bdf8; font-size:24px; font-weight:bold;">
              🐶
            </div>
          </div>
          <!-- Иконка маркера/породы -->
          <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-sky-400 flex items-center justify-center text-xs shadow-md">
            ${markerStyle.icon}
          </div>
        </div>

        <!-- Плашка с кличкой под собакой -->
        <div class="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-sky-400 text-white font-black text-[10px] whitespace-nowrap shadow-2xl flex items-center gap-1 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full animate-ping" style="background: ${leashInfo.bgColor};"></span>
          <span>${playerDog.name}</span>
          <span class="text-sky-400 text-[9px] font-extrabold">(Вы)</span>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'custom-player-avatar-marker',
      iconSize: [68, 86],
      iconAnchor: [34, 34]
    });

    if (!playerMarkerRef.current || !map.hasLayer(playerMarkerRef.current)) {
      if (playerMarkerRef.current) {
        playerMarkerRef.current.remove();
      }
      playerMarkerRef.current = L.marker([playerCoords.lat, playerCoords.lng], {
        icon,
        zIndexOffset: 10000
      }).addTo(map);
      playerMarkerRef.current.on('click', () => {
        onSelectDogCard(playerDog);
      });
    } else {
      playerMarkerRef.current.setLatLng([playerCoords.lat, playerCoords.lng]);
      playerMarkerRef.current.setIcon(icon);
    }

    // Авто-следование за собакой
    if (autoFollow) {
      map.panTo([playerCoords.lat, playerCoords.lng], { animate: true, duration: 0.3 });
    }
  }, [playerCoords, playerDog, autoFollow]);

  // 5. Обновление ботов-соседей
  useEffect(() => {
    if (!botsLayerGroupRef.current) return;
    const group = botsLayerGroupRef.current;
    group.clearLayers();

    bots.forEach((bot) => {
      const leashInfo = LEASH_COLORS[bot.leashColor] || LEASH_COLORS.yellow;
      const factionInfo = FACTIONS[bot.faction] || FACTIONS.free;

      const botHtml = `
        <div class="relative flex flex-col items-center cursor-pointer hover:scale-110 transition-transform select-none" style="width: 50px; height: 65px;">
          <!-- Фото бота в рамке цвета поводка -->
          <div class="w-11 h-11 rounded-full p-0.5 shadow-xl flex items-center justify-center" style="background: ${leashInfo.bgColor}; box-shadow: 0 0 10px ${factionInfo.borderColor}88;">
            <div class="w-full h-full rounded-full overflow-hidden border border-slate-900 bg-slate-900 flex items-center justify-center">
              <img 
                src="${bot.avatarUrl || ''}" 
                alt="${bot.name}" 
                class="w-full h-full object-cover" 
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background:#1e293b; color:#cbd5e1; font-size:18px;">
                🐕
              </div>
            </div>
          </div>
          <!-- Кличка бота -->
          <div class="mt-0.5 text-[9px] px-1.5 py-0.5 bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-md font-bold whitespace-nowrap shadow">
            ${bot.name}
          </div>
        </div>
      `;

      const botIcon = L.divIcon({
        html: botHtml,
        className: 'custom-bot-avatar-marker',
        iconSize: [50, 65],
        iconAnchor: [25, 25]
      });

      const marker = L.marker([bot.currentLat, bot.currentLng], { icon: botIcon });
      marker.on('click', () => {
        onSelectDogCard(bot);
      });

      group.addLayer(marker);
    });
  }, [bots]);

  // 6. Обновление меток безопасности
  useEffect(() => {
    if (!hazardsLayerGroupRef.current) return;
    const group = hazardsLayerGroupRef.current;
    group.clearLayers();

    hazards.forEach((hazard) => {
      const config = HAZARD_CONFIGS[hazard.type] || HAZARD_CONFIGS.glass;

      const hazardHtml = `
        <div class="relative flex items-center justify-center cursor-pointer animate-bounce" style="width: 38px; height: 38px;">
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-2xl border-2" style="background: ${config.color}; border-color: #f8fafc;">
            ${config.icon}
          </div>
        </div>
      `;

      const hazardIcon = L.divIcon({
        html: hazardHtml,
        className: 'custom-hazard-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([hazard.lat, hazard.lng], { icon: hazardIcon });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 170px;">
          <div style="font-weight: 700; color: ${config.color}; margin-bottom: 2px;">${config.icon} ${config.label}</div>
          <div style="margin-bottom: 6px;">${hazard.description}</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">Автор: ${hazard.authorName}</div>
          <div style="display: flex; gap: 6px;">
            <button id="vote-up-${hazard.id}" style="flex:1; padding: 4px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">👍 Видел (${hazard.upvotes})</button>
            <button id="vote-down-${hazard.id}" style="flex:1; padding: 4px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">🧹 Чисто (${hazard.downvotes})</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btnUp = document.getElementById(`vote-up-${hazard.id}`);
        const btnDown = document.getElementById(`vote-down-${hazard.id}`);
        if (btnUp) btnUp.onclick = () => onVoteHazard(hazard.id, true);
        if (btnDown) btnDown.onclick = () => onVoteHazard(hazard.id, false);
      });

      group.addLayer(marker);
    });
  }, [hazards]);

  // 7. Обновление линии трека выгула
  useEffect(() => {
    if (!trackPolylineRef.current) return;
    if (isWalking && walkPoints.length > 0) {
      const latlngs = walkPoints.map((p) => [p.lat, p.lng] as [number, number]);
      trackPolylineRef.current.setLatLngs(latlngs);
    } else {
      trackPolylineRef.current.setLatLngs([]);
    }
  }, [walkPoints, isWalking]);

  // Функция центрирования и приближения к собаке
  const handleCenterOnPlayer = () => {
    if (!mapInstanceRef.current) return;
    setAutoFollow(true);
    const currentZoom = mapInstanceRef.current.getZoom();
    // Приближаем до детального уровня двора (зум 18 или 19)
    const targetZoom = currentZoom < 18 ? 18 : (currentZoom === 18 ? 19 : 18);
    mapInstanceRef.current.flyTo([playerCoords.lat, playerCoords.lng], targetZoom, {
      animate: true,
      duration: 0.8
    });
  };

  return (
    <div className="h-full w-full relative z-0">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Кнопка "Где я? / Центрировать карту на собаке" */}
      <button
        onClick={handleCenterOnPlayer}
        className={`fixed bottom-24 right-20 z-40 p-3 rounded-2xl shadow-2xl border flex items-center gap-1.5 active:scale-95 transition-all ${
          autoFollow
            ? 'bg-sky-500 text-slate-950 font-bold border-sky-300 ring-2 ring-sky-400/40 shadow-sky-500/30'
            : 'bg-slate-900/90 text-sky-400 border-slate-700/80 hover:bg-slate-800'
        }`}
        title="Найти меня на карте (Центрировать камеру)"
      >
        <Crosshair className={`w-5 h-5 ${autoFollow ? 'animate-spin-slow' : ''}`} />
        <span className="text-xs font-bold hidden sm:inline">
          {autoFollow ? 'Слежу за псом' : 'Где я?'}
        </span>
      </button>
    </div>
  );
};
