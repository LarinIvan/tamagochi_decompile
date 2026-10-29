import React, { useState } from 'react';
import { Trophy, Medal, X, Flame, MapPin, Bone, Crown, Sparkles } from 'lucide-react';
import { Dog } from '../../types/user';
import { BotDog } from '../../types/simulation';
import { FACTIONS, LEASH_COLORS } from '../../types/user';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerDog: Dog;
  bots: BotDog[];
  ownerName: string;
}

type TabType = 'hexes' | 'km' | 'bones';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerDog,
  bots,
  ownerName
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('hexes');

  if (!isOpen) return null;

  // Объединяем игрока и ботов в единый список для таблицы лидеров
  const allDogs = [
    {
      id: playerDog.id,
      name: playerDog.name,
      breed: playerDog.breed,
      owner: `${ownerName} (Вы)`,
      avatarUrl: playerDog.avatarUrl,
      faction: playerDog.faction,
      leashColor: playerDog.leashColor,
      totalHexes: playerDog.totalHexes,
      totalKm: playerDog.totalKm,
      sugarBones: playerDog.sugarBones,
      rank: playerDog.rank,
      isPlayer: true
    },
    ...bots.map((b) => {
      const hexes = b.totalHexes ?? Math.floor(Math.random() * 30 + 15);
      const km = b.totalKm ?? parseFloat((hexes * 0.65).toFixed(1));
      return {
        id: b.id,
        name: b.name,
        breed: b.breed,
        owner: b.ownerName,
        avatarUrl: b.avatarUrl,
        faction: b.faction,
        leashColor: b.leashColor,
        totalHexes: hexes,
        totalKm: km,
        sugarBones: Math.round(km * 18 + hexes * 15),
        rank: b.rank ?? 'Патрульный двора',
        isPlayer: false
      };
    })
  ];

  // Сортировка по выбранной вкладке
  const sortedDogs = [...allDogs].sort((a, b) => {
    if (activeTab === 'hexes') return b.totalHexes - a.totalHexes;
    if (activeTab === 'km') return b.totalKm - a.totalKm;
    return b.sugarBones - a.sugarBones;
  });

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-lg shadow-amber-400/30 ring-2 ring-amber-300">
          <Crown className="w-4 h-4" />
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-xs shadow-lg ring-2 ring-slate-200">
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black flex items-center justify-center text-xs shadow-lg ring-2 ring-amber-600">
          3
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs border border-slate-700">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Заголовок */}
        <div className="relative p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Лидерборд района
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  Сезон 1
                </span>
              </h2>
              <p className="text-xs text-slate-400">Рейтинг собак ЖК «Хамовники / Парк»</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Вкладки переключения категорий */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-1.5">
          <button
            onClick={() => setActiveTab('hexes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'hexes'
                ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>По сотам (Кварталы)</span>
          </button>
          <button
            onClick={() => setActiveTab('km')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'km'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>По километрам</span>
          </button>
          <button
            onClick={() => setActiveTab('bones')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'bones'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bone className="w-3.5 h-3.5" />
            <span>Сахарные кости</span>
          </button>
        </div>

        {/* Список участников */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sortedDogs.map((dog, index) => {
            const faction = FACTIONS[dog.faction] || FACTIONS.free;
            const leash = LEASH_COLORS[dog.leashColor] || LEASH_COLORS.green;

            return (
              <div
                key={dog.id}
                className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  dog.isPlayer
                    ? 'bg-sky-500/10 border-sky-400/80 ring-1 ring-sky-400/40 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Номер в рейтинге */}
                <div className="flex-shrink-0">{getRankBadge(index)}</div>

                {/* Аватар собаки с цветом поводка */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-full p-0.5"
                    style={{ background: leash.bgColor }}
                  >
                    <img
                      src={dog.avatarUrl}
                      alt={dog.name}
                      className="w-full h-full rounded-full object-cover bg-slate-900"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-xs">
                    {faction.symbol}
                  </div>
                </div>

                {/* Информация о собаке */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white truncate">{dog.name}</span>
                    {dog.isPlayer && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-sky-500/20 text-sky-300 font-extrabold border border-sky-500/30">
                        ВЫ
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {dog.breed} • <span className="text-slate-300">{dog.owner}</span>
                  </div>
                </div>

                {/* Числовое значение по выбранной вкладке */}
                <div className="text-right flex-shrink-0">
                  {activeTab === 'hexes' && (
                    <div>
                      <div className="text-sm font-black text-sky-400 flex items-center justify-end gap-1">
                        <span>{dog.totalHexes}</span>
                        <span className="text-[10px] text-slate-400 font-normal">сот</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{dog.rank}</div>
                    </div>
                  )}

                  {activeTab === 'km' && (
                    <div>
                      <div className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
                        <span>{dog.totalKm.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-normal">км</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{dog.totalHexes} сот</div>
                    </div>
                  )}

                  {activeTab === 'bones' && (
                    <div>
                      <div className="text-sm font-black text-emerald-400 flex items-center justify-end gap-1">
                        <Bone className="w-3.5 h-3.5 fill-emerald-400" />
                        <span>{dog.sugarBones}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{dog.totalKm.toFixed(1)} км</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Нижняя информационная плашка */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Сезонные награды начисляются каждое воскресенье в 23:59</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
