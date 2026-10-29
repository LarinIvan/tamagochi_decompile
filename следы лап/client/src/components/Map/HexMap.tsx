import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BaseMapProvider, Coordinates, HexCell, MAP_PROVIDERS, WalkTrackPoint } from '../../types/map';
import { Dog, FACTIONS, LEASH_COLORS, MARKER_STYLES } from '../../types/user';
import { BotDog } from '../../types/simulation';
import { HazardMarker, HAZARD_CONFIGS } from '../../types/safety';
import { getH3Boundary } from '../../services/h3Engine';

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

  // 1. Инициализация карты (один раз)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [playerCoords.lat, playerCoords.lng],
      zoom: 17,
      minZoom: 13,
      maxZoom: 20,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Группы слоев
    hexLayerGroupRef.current = L.layerGroup().addTo(map);
    botsLayerGroupRef.current = L.layerGroup().addTo(map);
    hazardsLayerGroupRef.current = L.layerGroup().addTo(map);

    trackPolylineRef.current = L.polyline([], {
      color: '#38bdf8',
      weight: 4,
      dashArray: '4, 8',
      opacity: 0.85
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Смена базового тайлового слоя карты (Яндекс, 2GIS, Google, OSM, Carto)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = MAP_PROVIDERS[currentProvider];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || ['a', 'b', 'c']
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [currentProvider]);

  // 3. Обновление полигонов гексагонов Uber H3
  useEffect(() => {
    if (!hexLayerGroupRef.current) return;
    const group = hexLayerGroupRef.current;
    group.clearLayers();

    Object.values(hexCells).forEach((cell) => {
      const boundary = getH3Boundary(cell.h3Index);
      if (boundary.length === 0) return;

      const factionInfo = FACTIONS[cell.faction];
      const fillColor = factionInfo?.color || 'rgba(148, 163, 184, 0.2)';
      const borderColor = factionInfo?.borderColor || '#94a3b8';

      const polygon = L.polygon(boundary, {
        color: borderColor,
        weight: cell.isFortified ? 2.5 : 1.2,
        fillColor: fillColor,
        fillOpacity: cell.isFortified ? 0.6 : 0.35,
        dashArray: cell.isFortified ? undefined : '2, 4'
      });

      const fortifiedBadge = cell.isFortified ? '<span style="color:#facc15"> ★ Закрытый двор (Защита)</span>' : '';
      polygon.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0f172a; min-width: 140px;">
          <div style="font-weight: 700; margin-bottom: 2px;">${factionInfo?.name || 'Нейтральная сота'}</div>
          <div>Хозяин: <b>${cell.ownerDogName || 'Ничейная'}</b></div>
          <div>Запах (SP): <b>${cell.scentPoints} / 300</b></div>
          ${fortifiedBadge}
        </div>
      `);

      group.addLayer(polygon);
    });
  }, [hexCells]);

  // 4. Обновление маркера игрока
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const leashInfo = LEASH_COLORS[playerDog.leashColor] || LEASH_COLORS.green;
    const markerStyle = MARKER_STYLES.find((m) => m.id === playerDog.markerStyle) || MARKER_STYLES[0];

    const iconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer marker-pulse" style="width: 44px; height: 44px;">
        <div class="absolute inset-0 rounded-full" style="background: ${leashInfo.bgColor}; opacity: 0.35; filter: blur(4px);"></div>
        <div class="relative w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-2xl border-2" style="background: #0f172a; border-color: ${leashInfo.bgColor};">
          ${markerStyle.icon}
        </div>
        <div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-slate-900" style="background: ${leashInfo.bgColor};" title="${leashInfo.label}"></div>
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'custom-player-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (!playerMarkerRef.current) {
      playerMarkerRef.current = L.marker([playerCoords.lat, playerCoords.lng], { icon, zIndexOffset: 1000 }).addTo(map);
      playerMarkerRef.current.on('click', () => {
        onSelectDogCard(playerDog);
      });
    } else {
      playerMarkerRef.current.setLatLng([playerCoords.lat, playerCoords.lng]);
      playerMarkerRef.current.setIcon(icon);
    }
  }, [playerCoords, playerDog]);

  // 5. Обновление ботов-соседей
  useEffect(() => {
    if (!botsLayerGroupRef.current) return;
    const group = botsLayerGroupRef.current;
    group.clearLayers();

    bots.forEach((bot) => {
      const leashInfo = LEASH_COLORS[bot.leashColor] || LEASH_COLORS.yellow;
      const markerStyle = MARKER_STYLES.find((m) => m.id === bot.markerStyle) || MARKER_STYLES[0];

      const botHtml = `
        <div class="relative flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" style="width: 38px; height: 38px;">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-xl border-2" style="background: #1e293b; border-color: ${leashInfo.bgColor};">
            ${markerStyle.icon}
          </div>
          <div class="absolute -bottom-1 text-[9px] px-1 bg-slate-900/90 text-slate-200 rounded font-semibold whitespace-nowrap shadow">
            ${bot.name}
          </div>
        </div>
      `;

      const botIcon = L.divIcon({
        html: botHtml,
        className: 'custom-bot-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker([bot.currentLat, bot.currentLng], { icon: botIcon });
      marker.on('click', () => {
        onSelectDogCard(bot);
      });

      group.addLayer(marker);
    });
  }, [bots]);

  // 6. Обновление меток безопасности (Crowd-Safety)
  useEffect(() => {
    if (!hazardsLayerGroupRef.current) return;
    const group = hazardsLayerGroupRef.current;
    group.clearLayers();

    hazards.forEach((hazard) => {
      const config = HAZARD_CONFIGS[hazard.type] || HAZARD_CONFIGS.glass;

      const hazardHtml = `
        <div class="relative flex items-center justify-center cursor-pointer animate-bounce" style="width: 36px; height: 36px;">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-base shadow-2xl border-2" style="background: ${config.color}; border-color: #f8fafc;">
            ${config.icon}
          </div>
        </div>
      `;

      const hazardIcon = L.divIcon({
        html: hazardHtml,
        className: 'custom-hazard-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
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

  return <div ref={mapContainerRef} className="h-full w-full relative z-0" />;
};
