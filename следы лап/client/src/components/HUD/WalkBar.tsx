import React, { useState, useEffect } from 'react';
import { Play, Square, Award, Bone, Footprints, Clock } from 'lucide-react';
import { Dog, FACTIONS } from '../../types/user';
import { ActiveWalk } from '../../types/map';

interface WalkBarProps {
  dog: Dog;
  activeWalk: ActiveWalk;
  onStartWalk: () => void;
  onFinishWalk: () => void;
}

export const WalkBar: React.FC<WalkBarProps> = ({
  dog,
  activeWalk,
  onStartWalk,
  onFinishWalk
}) => {
  const [elapsedSec, setElapsedSec] = useState(0);
  const factionInfo = FACTIONS[dog.faction];

  useEffect(() => {
    let timer: any = null;
    if (activeWalk.isActive) {
      timer = setInterval(() => {
        const sec = Math.floor((Date.now() - activeWalk.startTime) / 1000);
        setElapsedSec(sec);
      }, 1000);
    } else {
      setElapsedSec(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeWalk.isActive, activeWalk.startTime]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distanceKm = (activeWalk.distanceMeters / 1000).toFixed(2);

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] z-30">
      {!activeWalk.isActive ? (
        /* Режим ожидания: Кнопка Старт */
        <button
          onClick={onStartWalk}
          className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 bg-[length:200%_auto] hover:bg-right hover:brightness-110 text-white rounded-3xl font-extrabold text-base shadow-2xl flex items-center justify-between border border-white/20 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              🐾
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold uppercase tracking-wide">Начать выгул</div>
              <div className="text-xs text-sky-100 font-medium">
                С {dog.name} ({factionInfo?.name})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/20 rounded-xl text-xs font-bold">
            <Play className="w-4 h-4 fill-current" />
            <span>Старт</span>
          </div>
        </button>
      ) : (
        /* Активный выгул: Живая статистика */
        <div className="bg-slate-900/95 backdrop-blur-xl border border-sky-500/50 rounded-3xl p-4 shadow-2xl flex items-center justify-between gap-3 text-slate-100 ring-2 ring-sky-500/20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Время */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-sm font-bold text-white">
                {formatTime(elapsedSec)}
              </span>
            </div>

            <div className="w-px h-5 bg-slate-700" />

            {/* Километраж */}
            <div className="flex items-center gap-1">
              <Footprints className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">{distanceKm} км</span>
            </div>

            <div className="w-px h-5 bg-slate-700" />

            {/* Захвачено сот */}
            <div className="flex items-center gap-1">
              <span className="text-sm">🐾</span>
              <span className="text-xs font-bold text-sky-300">
                {activeWalk.hexesCaptured.length}
              </span>
            </div>

            <div className="w-px h-5 bg-slate-700" />

            {/* Косточки */}
            <div className="flex items-center gap-1">
              <Bone className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span className="text-xs font-bold text-amber-300">
                +{activeWalk.bonesEarned}
              </span>
            </div>
          </div>

          {/* Кнопка Завершить */}
          <button
            onClick={onFinishWalk}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-2xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Завершить</span>
          </button>
        </div>
      )}
    </div>
  );
};
