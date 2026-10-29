import React, { useState, useEffect, useRef } from 'react';
import { StorageService, DEFAULT_COORDS } from './services/storageService';
import { geoService, GeoMode, GeoState } from './services/geoService';
import { TerritoryEngine } from './services/territoryEngine';
import { BotSimulator, INITIAL_BOTS } from './services/botSimulator';
import { soundService } from './services/soundService';
import { coordToH3, getDistanceMeters } from './services/h3Engine';
import { UserProfile, Dog } from './types/user';
import { BaseMapProvider, HexCell, Coordinates, ActiveWalk, WalkTrackPoint } from './types/map';
import { HazardMarker, SosAlert } from './types/safety';
import { BotDog } from './types/simulation';

// Компоненты интерфейса
import { HexMap } from './components/Map/HexMap';
import { TopBar } from './components/HUD/TopBar';
import { WalkBar } from './components/HUD/WalkBar';
import { VirtualJoystick } from './components/DevTools/VirtualJoystick';
import { DevDrawer } from './components/DevTools/DevDrawer';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { DogProfileModal } from './components/Profile/DogProfileModal';
import { DogCardModal } from './components/Profile/DogCardModal';
import { HazardModal } from './components/Safety/HazardModal';
import { SosModal } from './components/Safety/SosModal';
import { WalkSummaryModal } from './components/HUD/WalkSummaryModal';
import { HazardAlertBanner } from './components/Safety/HazardAlertBanner';
import { TerritoryStatusCard } from './components/HUD/TerritoryStatusCard';
import { GameGuideModal } from './components/HUD/GameGuideModal';
import { LeaderboardModal } from './components/HUD/LeaderboardModal';

export const App: React.FC = () => {
  // 1. Состояние профиля и питомцев
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const selectedDog =
    profile.dogs.find((d) => d.id === profile.selectedDogId) || profile.dogs[0];

  // 2. Картография и гео
  const [currentProvider, setCurrentProvider] = useState<BaseMapProvider>(() =>
    StorageService.getBaseMap()
  );
  const [playerCoords, setPlayerCoords] = useState<Coordinates>(() =>
    StorageService.getLastCoords()
  );
  const [geoMode, setGeoMode] = useState<GeoMode>('simulation');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  // 3. Соты Uber H3, боты, метки опасности
  const [hexCells, setHexCells] = useState<Record<string, HexCell>>(() =>
    StorageService.getHexCells()
  );
  const [bots, setBots] = useState<BotDog[]>(INITIAL_BOTS);
  const [hazards, setHazards] = useState<HazardMarker[]>(() => StorageService.getHazards());

  // 4. Активный выгул
  const [activeWalk, setActiveWalk] = useState<ActiveWalk>({
    isActive: false,
    startTime: 0,
    distanceMeters: 0,
    durationSeconds: 0,
    hexesCaptured: [],
    loopsEnclosed: 0,
    points: [],
    bonesEarned: 0
  });

  // 5. Модальные окна
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isDogProfileModalOpen, setIsDogProfileModalOpen] = useState(false);
  const [dogToEdit, setDogToEdit] = useState<Dog | null>(null);
  const [selectedDogForCard, setSelectedDogForCard] = useState<any | null>(null);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [lastCompletedWalk, setLastCompletedWalk] = useState<ActiveWalk | null>(null);

  // 6. Уведомления и алерты опасности
  const [activeAlertHazard, setActiveAlertHazard] = useState<HazardMarker | null>(null);
  const [alertDistanceMeters, setAlertDistanceMeters] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAutoLooping, setIsAutoLooping] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Инициализация координат гео-сервиса
  useEffect(() => {
    geoService.setInitialCoords(playerCoords);
  }, []);

  // Сохранение изменений в Storage
  useEffect(() => {
    StorageService.saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    StorageService.saveHexCells(hexCells);
  }, [hexCells]);

  useEffect(() => {
    StorageService.saveHazards(hazards);
  }, [hazards]);

  // Подписка на гео-сервис (перемещение игрока)
  useEffect(() => {
    const unsubscribe = geoService.subscribe((state: GeoState) => {
      const prevCoords = playerCoords;
      const nextCoords = state.coords;
      setPlayerCoords(nextCoords);
      StorageService.saveLastCoords(nextCoords);

      // Логика во время активного выгула
      if (activeWalk.isActive) {
        const stepDist = getDistanceMeters(
          prevCoords.lat,
          prevCoords.lng,
          nextCoords.lat,
          nextCoords.lng
        );

        // Если сдвинулись хотя бы на 1.5 метра
        if (stepDist >= 1.5) {
          const newPoint: WalkTrackPoint = {
            lat: nextCoords.lat,
            lng: nextCoords.lng,
            timestamp: Date.now()
          };

          const newPoints = [...activeWalk.points, newPoint];
          const newDist = activeWalk.distanceMeters + stepDist;

          // Проверка текущего гексагона H3
          const cellId = coordToH3(nextCoords.lat, nextCoords.lng);
          const captureRes = TerritoryEngine.processHexVisit(cellId, selectedDog, hexCells);

          let newHexesCaptured = [...activeWalk.hexesCaptured];
          let earnedBones = activeWalk.bonesEarned + captureRes.bonesEarned;

          if (captureRes.isNewCapture && !newHexesCaptured.includes(cellId)) {
            newHexesCaptured.push(cellId);
            soundService.playHexCapture();
            showToast(captureRes.message);
          }

          // Проверка замыкания контура
          const loopRes = TerritoryEngine.processLoopEnclosure(newPoints, selectedDog, captureRes.updatedHexes);
          if (loopRes.enclosedCount > 0) {
            earnedBones += loopRes.bonesEarned;
            soundService.playLoopEnclosed();
            showToast(loopRes.message || '🔄 Контур квартала замкнут!');
          }

          setHexCells(loopRes.updatedHexes);

          setActiveWalk((prev) => ({
            ...prev,
            distanceMeters: newDist,
            points: newPoints,
            hexesCaptured: newHexesCaptured,
            loopsEnclosed: prev.loopsEnclosed + (loopRes.enclosedCount > 0 ? 1 : 0),
            bonesEarned: earnedBones
          }));
        }
      }

      // Проверка приближения к меткам опасности (Crowd-Safety)
      let foundHazard: HazardMarker | null = null;
      let minHazardDist = 999999;

      for (const h of hazards) {
        const d = getDistanceMeters(nextCoords.lat, nextCoords.lng, h.lat, h.lng);
        if (d <= 60 && d < minHazardDist) {
          minHazardDist = d;
          foundHazard = h;
        }
      }

      if (foundHazard) {
        if ((activeAlertHazard as HazardMarker | null)?.id !== foundHazard.id) {
          soundService.playHazardWarning();
        }
        setActiveAlertHazard(foundHazard);
        setAlertDistanceMeters(minHazardDist);
      } else {
        setActiveAlertHazard(null);
      }
    });

    return () => unsubscribe();
  }, [activeWalk.isActive, hexCells, hazards, selectedDog]);

  // Фоновый цикл обновления ботов (раз в секунду)
  useEffect(() => {
    const interval = setInterval(() => {
      setBots((prevBots) => {
        const { updatedBots, updatedHexes } = BotSimulator.updateBotsStep(
          prevBots,
          hexCells,
          1.0,
          speedMultiplier
        );
        setHexCells(updatedHexes);
        return updatedBots;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hexCells, speedMultiplier]);

  // Старт выгула
  const handleStartWalk = () => {
    setActiveWalk({
      isActive: true,
      startTime: Date.now(),
      distanceMeters: 0,
      durationSeconds: 0,
      hexesCaptured: [],
      loopsEnclosed: 0,
      points: [{ lat: playerCoords.lat, lng: playerCoords.lng, timestamp: Date.now() }],
      bonesEarned: 0
    });
    showToast(`🐾 Выгул с ${selectedDog.name} начат!`);
  };

  // Завершение выгула
  const handleFinishWalk = () => {
    const finalSec = Math.floor((Date.now() - activeWalk.startTime) / 1000);
    const completedWalk: ActiveWalk = {
      ...activeWalk,
      durationSeconds: finalSec
    };

    // Начисление опыта, косточек и пройденного км собаке
    const km = Number((completedWalk.distanceMeters / 1000).toFixed(2));
    const updatedDogs = profile.dogs.map((d) => {
      if (d.id === selectedDog.id) {
        const newTotalKm = Number((d.totalKm + km).toFixed(2));
        const newTotalHexes = d.totalHexes + completedWalk.hexesCaptured.length;
        const newBones = d.sugarBones + completedWalk.bonesEarned;
        const newExp = d.exp + completedWalk.bonesEarned * 2;
        const newLevel = Math.max(1, Math.floor(newExp / 100) + 1);

        return {
          ...d,
          totalKm: newTotalKm,
          totalHexes: newTotalHexes,
          sugarBones: newBones,
          exp: newExp,
          level: newLevel
        };
      }
      return d;
    });

    setProfile({
      ...profile,
      dogs: updatedDogs
    });

    setLastCompletedWalk(completedWalk);
    setIsSummaryModalOpen(true);
    setActiveWalk({
      isActive: false,
      startTime: 0,
      distanceMeters: 0,
      durationSeconds: 0,
      hexesCaptured: [],
      loopsEnclosed: 0,
      points: [],
      bonesEarned: 0
    });
  };

  // Авто-обход квартала для тестирования замыкания контура
  const handleStartAutoLoop = () => {
    if (isAutoLooping) return;
    setIsAutoLooping(true);
    if (!activeWalk.isActive) handleStartWalk();

    showToast('🔄 Запуск авто-обхода квартала...');

    const start = playerCoords;
    const radius = 0.0012; // ~130м радиус
    const steps = 12;
    const waypoints: Coordinates[] = [];

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      waypoints.push({
        lat: start.lat + Math.cos(angle) * radius,
        lng: start.lng + Math.sin(angle) * radius
      });
    }

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep >= waypoints.length) {
        clearInterval(stepInterval);
        setIsAutoLooping(false);
        showToast('🏁 Авто-обход завершен! Контур замкнут!');
        return;
      }
      geoService.moveToTarget(waypoints[currentStep]);
      currentStep++;
    }, 1200);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Полноэкранная интерактивная карта */}
      <HexMap
        currentProvider={currentProvider}
        playerCoords={playerCoords}
        playerDog={selectedDog}
        hexCells={hexCells}
        bots={bots}
        hazards={hazards}
        walkPoints={activeWalk.points}
        isWalking={activeWalk.isActive}
        onMapClick={(coords) => {
          if (geoMode === 'simulation') {
            geoService.moveToTarget(coords);
          }
        }}
        onSelectDogCard={(dog) => setSelectedDogForCard(dog)}
        onVoteHazard={(hazardId, isUp) => {
          setHazards((prev) =>
            prev.map((h) => {
              if (h.id === hazardId) {
                return {
                  ...h,
                  upvotes: isUp ? h.upvotes + 1 : h.upvotes,
                  downvotes: !isUp ? h.downvotes + 1 : h.downvotes
                };
              }
              return h;
            })
          );
          showToast(isUp ? '👍 Метка подтверждена (+5 косточек)' : '🧹 Сообщено об очистке');
        }}
      />

      {/* 2. Верхняя панель управления (HUD TopBar) */}
      <TopBar
        profile={profile}
        selectedDog={selectedDog}
        currentProvider={currentProvider}
        onSelectProvider={(p) => {
          setCurrentProvider(p);
          StorageService.saveBaseMap(p);
        }}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
        onOpenHazardModal={() => setIsHazardModalOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onSelectDog={(id) => setProfile({ ...profile, selectedDogId: id })}
      />

      {/* 2.5. Виджет текущего сектора и битвы за район */}
      <TerritoryStatusCard
        playerCoords={playerCoords}
        hexCells={hexCells}
        playerDog={selectedDog}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* 3. Нижняя панель выгула (HUD WalkBar) */}
      <WalkBar
        dog={selectedDog}
        activeWalk={activeWalk}
        onStartWalk={handleStartWalk}
        onFinishWalk={handleFinishWalk}
      />

      {/* 4. Экранный джойстик (в режиме симуляции) */}
      <VirtualJoystick isVisible={geoMode === 'simulation'} />

      {/* 5. Панель разработчика и симуляции (DevDrawer) */}
      <DevDrawer
        geoMode={geoMode}
        speedMultiplier={speedMultiplier}
        onToggleGeoMode={(m) => {
          setGeoMode(m);
          geoService.setMode(m);
        }}
        onSelectSpeed={(mult) => {
          setSpeedMultiplier(mult);
          geoService.setSpeedMultiplier(mult);
        }}
        onStartAutoLoop={handleStartAutoLoop}
        isAutoLooping={isAutoLooping}
        onRunBotsStep={() => {
          setBots((prevBots) => {
            const { updatedBots, updatedHexes } = BotSimulator.updateBotsStep(
              prevBots,
              hexCells,
              5.0,
              speedMultiplier
            );
            setHexCells(updatedHexes);
            return updatedBots;
          });
          showToast('🤖 Боты двора вышли на активный патруль!');
        }}
        onSpawnHazard={() => {
          const h = BotSimulator.spawnRandomHazardNear(playerCoords);
          setHazards((prev) => [h, ...prev]);
          showToast(`🧪 Появилась новая метка: ${h.description}`);
        }}
        onSimulateDecay={() => {
          setHexCells((prev) => TerritoryEngine.decayHexes(prev));
          showToast('⏳ Промотано 24 часа: соты потеряли 33% запаха (Decay)');
        }}
        onResetMap={() => {
          localStorage.removeItem('sledy_lap_hex_cells_v1');
          setHexCells(StorageService.getHexCells());
          showToast('Соты сброшены к начальным');
        }}
      />

      {/* 6. Предупреждение о сближении с опасностью */}
      <HazardAlertBanner
        hazard={activeAlertHazard}
        distanceMeters={alertDistanceMeters}
        onDismiss={() => setActiveAlertHazard(null)}
      />

      {/* 7. Всплывающий тост */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl border border-sky-400/60 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold text-white animate-in zoom-in-95 duration-150 flex items-center gap-2">
          <span>🐾</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 8. Модальные окна */}
      <UserProfileModal
        profile={profile}
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        onSaveProfile={(p) => setProfile(p)}
        onOpenAddDog={() => {
          setDogToEdit(null);
          setIsDogProfileModalOpen(true);
        }}
        onSelectDog={(id) => setProfile({ ...profile, selectedDogId: id })}
        onEditDog={(d) => {
          setDogToEdit(d);
          setIsDogProfileModalOpen(true);
        }}
      />

      <DogProfileModal
        dog={dogToEdit}
        isOpen={isDogProfileModalOpen}
        onClose={() => {
          setIsDogProfileModalOpen(false);
          setDogToEdit(null);
        }}
        onSaveDog={(savedDog) => {
          const exists = profile.dogs.some((d) => d.id === savedDog.id);
          const newDogs = exists
            ? profile.dogs.map((d) => (d.id === savedDog.id ? savedDog : d))
            : [...profile.dogs, savedDog];

          setProfile({
            ...profile,
            dogs: newDogs,
            selectedDogId: savedDog.id
          });
          showToast(`Питомца «${savedDog.name}» сохранено!`);
        }}
      />

      <DogCardModal
        dog={selectedDogForCard}
        isOpen={Boolean(selectedDogForCard)}
        onClose={() => setSelectedDogForCard(null)}
        onWavePaw={(name) => showToast(`Вы помахали лапой собаке ${name}! 🐾`)}
      />

      <HazardModal
        isOpen={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
        playerCoords={playerCoords}
        authorName={profile.name}
        onAddHazard={(h) => {
          setHazards((prev) => [h, ...prev]);
          showToast('Метка опасности опубликована на карте района!');
        }}
      />

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        dog={selectedDog}
        playerCoords={playerCoords}
        onSendSos={(alert: SosAlert) => {
          showToast(`🚨 SOS отправлен всем владельцам в радиусе ${alert.radiusKm} км!`);
        }}
      />

      {lastCompletedWalk && (
        <WalkSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          walk={lastCompletedWalk}
          dog={selectedDog}
        />
      )}

      {/* Обучающее окно: Смысл игры и захват района */}
      <GameGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Лидерборд района (Рейтинг собак ЖК) */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerDog={selectedDog}
        bots={bots}
        ownerName={profile.name}
      />
    </div>
  );
};
