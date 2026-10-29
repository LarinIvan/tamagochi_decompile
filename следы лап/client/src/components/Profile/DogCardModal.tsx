import React, { useState } from 'react';
import { X, Award, Shield, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { FACTIONS, LEASH_COLORS } from '../../types/user';

interface DogCardModalProps {
  dog: any | null; // Dog or BotDog
  isOpen: boolean;
  onClose: () => void;
  onWavePaw: (dogName: string) => void;
}

export const DogCardModal: React.FC<DogCardModalProps> = ({
  dog,
  isOpen,
  onClose,
  onWavePaw
}) => {
  if (!isOpen || !dog) return null;

  const [hasWaved, setHasWaved] = useState(false);
  const factionInfo = FACTIONS[dog.faction as keyof typeof FACTIONS];
  const leashInfo = LEASH_COLORS[dog.leashColor as keyof typeof LEASH_COLORS] || LEASH_COLORS.green;

  const handleWave = () => {
    setHasWaved(true);
    onWavePaw(dog.name);
    setTimeout(() => setHasWaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Фотография и бейдж поводка */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-700">
          <img
            src={dog.avatarUrl}
            alt={dog.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

          {/* Бейдж поводка */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md"
            style={{ background: leashInfo.bgColor, color: '#020617' }}
          >
            {leashInfo.badge}
          </div>

          {/* Имя и порода внизу фото */}
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              {dog.name}
              <span className="text-sm font-normal text-slate-300">
                ({dog.gender === 'female' ? '♀' : '♂'}, {dog.weightKg} кг)
              </span>
            </h2>
            <div className="text-xs text-sky-300 font-medium">{dog.breed}</div>
          </div>
        </div>

        {/* Хозяин и Фракция */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">Хозяин</div>
            <div className="font-semibold text-slate-200">{dog.ownerName || 'Вы'}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Фракция</div>
            <div className="font-bold flex items-center gap-1" style={{ color: factionInfo?.borderColor }}>
              <span>{factionInfo?.symbol}</span>
              <span>{factionInfo?.name}</span>
            </div>
          </div>
        </div>

        {/* Статус поводка с пояснением */}
        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs">
          <div className="font-semibold text-slate-200 mb-0.5">{leashInfo.label}:</div>
          <div className="text-slate-400 text-[11px] leading-relaxed">{leashInfo.description}</div>
        </div>

        {/* Повадки */}
        {dog.habits && dog.habits.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Повадки
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dog.habits.map((h: string, idx: number) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  🐾 {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка "Помахать лапой" */}
        <button
          onClick={handleWave}
          disabled={hasWaved}
          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
            hasWaved
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
              : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:brightness-110'
          }`}
        >
          {hasWaved ? (
            <>
              <Heart className="w-4 h-4 fill-current animate-ping" />
              <span>Вы помахали лапой {dog.name}! 🐾</span>
            </>
          ) : (
            <>
              <span>🐾</span>
              <span>Помахать лапой питомцу</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
