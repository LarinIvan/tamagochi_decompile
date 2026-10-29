import React from 'react';
import { Shield, Trophy, HelpCircle, Swords, Users } from 'lucide-react';
import { HexCell, Coordinates } from '../../types/map';
import { Dog, FACTIONS } from '../../types/user';
import { coordToH3 } from '../../services/h3Engine';

interface TerritoryStatusCardProps {
  playerCoords: Coordinates;
  hexCells: Record<string, HexCell>;
  playerDog: Dog;
  onOpenGuide: () => void;
}

export const TerritoryStatusCard: React.FC<TerritoryStatusCardProps> = ({
  playerCoords,
  hexCells,
  playerDog,
  onOpenGuide
}) => {
  const currentHexId = coordToH3(playerCoords.lat, playerCoords.lng);
  const currentCell = hexCells[currentHexId];

  // Подсчет контроля района всеми фракциями
  const totalCells = Object.keys(hexCells).length || 1;
  const counts = { sprinters: 0, guardians: 0, free: 0 };
  Object.values(hexCells).forEach((c) => {
    if (counts[c.faction] !== undefined) counts[c.faction]++;
  });

  const pctSprinters = Math.round((counts.sprinters / totalCells) * 100);
  const pctGuardians = Math.round((counts.guardians / totalCells) * 100);
  const pctFree = Math.round((counts.free / totalCells) * 100);

  const factionInfo = currentCell ? FACTIONS[currentCell.faction] : null;

  return (
    <div className="fixed top-18 sm:top-20 left-4 z-30 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2 max-w-[240px] sm:max-w-xs text-slate-100">
        {/* Заголовок и кнопка "Как играть?" */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
            <Swords className="w-3.5 h-3.5" />
            <span>Битва за район</span>
          </div>
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-all active:scale-95"
            title="Правила игры"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Смысл игры?</span>
          </button>
        </div>

        {/* Текущий сектор, где стоит игрок */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Текущий сектор (100м сота):
          </div>
          {currentCell ? (
            <div className="mt-0.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 truncate" style={{ color: factionInfo?.borderColor }}>
                  <span>{factionInfo?.symbol}</span>
                  <span className="truncate">{factionInfo?.name}</span>
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {currentCell.scentPoints}/300 SP
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Хозяин: <span className="text-white font-medium">{currentCell.ownerDogName || 'Ничейная'}</span>
              </div>
              {/* Прогресс-бар прочности */}
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (currentCell.scentPoints / 300) * 100)}%`,
                    background: factionInfo?.borderColor || '#38bdf8'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-xs text-amber-300/90 font-medium mt-0.5 flex items-center gap-1">
              <span>⚪</span>
              <span>Свободный двор (Пройдите для захвата!)</span>
            </div>
          )}
        </div>

        {/* Контроль микрорайона */}
        <div className="pt-1.5 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
            <span>Влияние в квартале:</span>
            <span className="font-bold text-sky-400">{totalCells} сот</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
            <div
              style={{ width: `${pctSprinters}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`Лига Спринтеров: ${pctSprinters}%`}
            />
            <div
              style={{ width: `${pctGuardians}%` }}
              className="bg-red-500 h-full transition-all"
              title={`Орден Стражей: ${pctGuardians}%`}
            />
            <div
              style={{ width: `${pctFree}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Братство Вольных: ${pctFree}%`}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
            <span className="text-blue-400">🔵 {pctSprinters}%</span>
            <span className="text-red-400">🔴 {pctGuardians}%</span>
            <span className="text-amber-400">🟡 {pctFree}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
