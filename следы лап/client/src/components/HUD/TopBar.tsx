import React from 'react';
import { User, Siren, AlertTriangle, Bone, ChevronDown } from 'lucide-react';
import { UserProfile, Dog } from '../../types/user';
import { BaseMapProvider } from '../../types/map';
import { LayerSwitch } from '../Map/LayerSwitch';

interface TopBarProps {
  profile: UserProfile;
  selectedDog: Dog;
  currentProvider: BaseMapProvider;
  onSelectProvider: (p: BaseMapProvider) => void;
  onOpenProfile: () => void;
  onOpenHazardModal: () => void;
  onOpenSosModal: () => void;
  onSelectDog: (dogId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  profile,
  selectedDog,
  currentProvider,
  onSelectProvider,
  onOpenProfile,
  onOpenHazardModal,
  onOpenSosModal,
  onSelectDog
}) => {
  return (
    <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* Левая часть: Профиль и выбор активной собаки */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 pr-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          title="Открыть профиль"
        >
          <img
            src={selectedDog.avatarUrl}
            alt={selectedDog.name}
            className="w-8 h-8 rounded-xl object-cover border border-sky-400"
          />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight text-white flex items-center gap-1">
              {selectedDog.name}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-[10px] text-sky-400 font-medium">{selectedDog.breed}</div>
          </div>
        </button>

        {/* Быстрое переключение собаки если их несколько */}
        {profile.dogs.length > 1 && (
          <div className="flex gap-1 bg-slate-900/90 backdrop-blur-md p-1 border border-slate-700/80 rounded-2xl shadow-xl">
            {profile.dogs.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDog(d.id)}
                className={`w-8 h-8 rounded-xl overflow-hidden border transition-all ${
                  d.id === selectedDog.id
                    ? 'border-sky-400 ring-2 ring-sky-500/40 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                title={`Переключить на ${d.name}`}
              >
                <img src={d.avatarUrl} alt={d.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Центральная часть: Баланс косточек и ранг собаки */}
      <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl pointer-events-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Bone className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{selectedDog.sugarBones}</span>
        </div>
        <div className="w-px h-3.5 bg-slate-700" />
        <div className="text-xs text-slate-300 font-medium">
          {selectedDog.rank} <span className="text-[10px] text-sky-400">(ур. {selectedDog.level})</span>
        </div>
      </div>

      {/* Правая часть: Смена карты, кнопка Опасность и SOS */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Переключатель слоев карт */}
        <LayerSwitch currentProvider={currentProvider} onSelectProvider={onSelectProvider} />

        {/* Кнопка "Опасность" */}
        <button
          onClick={onOpenHazardModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 hover:bg-rose-950/40 hover:border-rose-500/60 rounded-xl text-xs font-bold text-rose-400 shadow-xl transition-all active:scale-95"
          title="Сообщить об опасности"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">Опасность</span>
        </button>

        {/* Кнопка SOS */}
        <button
          onClick={onOpenSosModal}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-2xl transition-all active:scale-95 animate-pulse"
          title="Экстренное оповещение SOS: пропала собака"
        >
          <Siren className="w-4 h-4" />
          <span>SOS</span>
        </button>
      </div>
    </header>
  );
};
