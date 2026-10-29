import React, { useState } from 'react';
import { Settings, Play, FastForward, RotateCcw, Bot, AlertCircle, Clock, Navigation } from 'lucide-react';
import { GeoMode } from '../../services/geoService';

interface DevDrawerProps {
  geoMode: GeoMode;
  speedMultiplier: number;
  onToggleGeoMode: (mode: GeoMode) => void;
  onSelectSpeed: (mult: number) => void;
  onStartAutoLoop: () => void;
  isAutoLooping: boolean;
  onRunBotsStep: () => void;
  onSpawnHazard: () => void;
  onSimulateDecay: () => void;
  onResetMap: () => void;
}

export const DevDrawer: React.FC<DevDrawerProps> = ({
  geoMode,
  speedMultiplier,
  onToggleGeoMode,
  onSelectSpeed,
  onStartAutoLoop,
  isAutoLooping,
  onRunBotsStep,
  onSpawnHazard,
  onSimulateDecay,
  onResetMap
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Кнопка открытия панели разработчика */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl border border-indigo-400/50 flex items-center gap-1.5 active:scale-95 transition-all"
        title="Панель симулятора (Dev Tools)"
      >
        <Settings className="w-5 h-5 animate-spin-slow" />
        <span className="text-xs font-bold hidden sm:inline">Симулятор</span>
      </button>

      {/* Выдвижная панель */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 sm:right-6 w-80 max-h-[75vh] overflow-y-auto z-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
              <Settings className="w-4 h-4" />
              Песочница и симуляция
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Режим геолокации */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Источник GPS
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleGeoMode('simulation')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  geoMode === 'simulation'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                🕹️ Симуляция
              </button>
              <button
                onClick={() => onToggleGeoMode('real')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  geoMode === 'real'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                🛰️ Реальный GPS
              </button>
            </div>
          </div>

          {/* Скорость симуляции */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Скорость перемещения
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1x (Шаг)', val: 1 },
                { label: '5x (Бег)', val: 5 },
                { label: '20x (Тест)', val: 20 }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => onSelectSpeed(s.val)}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    speedMultiplier === s.val
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Быстрые действия симулятора */}
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Тестовые сценарии
            </label>

            {/* Авто-обход квартала */}
            <button
              onClick={onStartAutoLoop}
              disabled={isAutoLooping}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow ${
                isAutoLooping
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-indigo-600 to-sky-600 hover:brightness-110 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {isAutoLooping ? 'Обхожу квартал... 🐾' : '🔄 Обойти квартал (Замкнуть контур)'}
            </button>

            {/* Выгул ботов */}
            <button
              onClick={onRunBotsStep}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              🤖 Запустить активность ботов двора
            </button>

            {/* Спавн опасности */}
            <button
              onClick={onSpawnHazard}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <AlertCircle className="w-4 h-4 text-rose-400" />
              🧪 Спавн угрозы в 50м (Тест сирены)
            </button>

            {/* Затухание Decay */}
            <button
              onClick={onSimulateDecay}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              ⏳ Промотать 24 часа (Decay -33% SP)
            </button>

            {/* Сброс */}
            <button
              onClick={onResetMap}
              className="w-full py-2 px-3 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-medium text-xs rounded-xl transition-colors border border-slate-800 mt-1"
            >
              Сбросить соты к начальным
            </button>
          </div>
        </div>
      )}
    </>
  );
};
