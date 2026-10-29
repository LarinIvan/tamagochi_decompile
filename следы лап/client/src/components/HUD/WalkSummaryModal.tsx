import React from 'react';
import { Award, Bone, Footprints, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { ActiveWalk } from '../../types/map';
import { Dog } from '../../types/user';

interface WalkSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  walk: ActiveWalk;
  dog: Dog;
}

export const WalkSummaryModal: React.FC<WalkSummaryModalProps> = ({
  isOpen,
  onClose,
  walk,
  dog
}) => {
  if (!isOpen) return null;

  const distanceKm = (walk.distanceMeters / 1000).toFixed(2);
  const minutes = Math.max(1, Math.floor(walk.durationSeconds / 60));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border border-sky-500/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100 text-center ring-2 ring-sky-500/20">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto shadow-2xl border-2 border-white/40 animate-bounce">
          🏆
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white">Прогулка завершена!</h2>
          <div className="text-xs text-sky-400 font-medium mt-0.5">
            {dog.name} доволен и нагулялся на славу!
          </div>
        </div>

        {/* Статистика выгула */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-left">
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400">Дистанция</div>
              <div className="text-xs font-bold text-white">{distanceKm} км</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[10px] text-slate-400">Время</div>
              <div className="text-xs font-bold text-white">{minutes} мин</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">🐾</span>
            <div>
              <div className="text-[10px] text-slate-400">Захвачено сот</div>
              <div className="text-xs font-bold text-white">{walk.hexesCaptured.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Bone className="w-4 h-4 fill-amber-400 text-amber-500" />
            <div>
              <div className="text-[10px] text-slate-400">Заработано</div>
              <div className="text-xs font-bold text-amber-300">+{walk.bonesEarned} костей</div>
            </div>
          </div>
        </div>

        {walk.loopsEnclosed > 0 && (
          <div className="p-2.5 bg-indigo-950/50 border border-indigo-500/40 rounded-xl text-xs text-indigo-300 flex items-center justify-center gap-1.5 font-semibold">
            <RotateCcw className="w-4 h-4" />
            Замкнуто контуров: {walk.loopsEnclosed}!
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-xl active:scale-98"
        >
          Супер, сохранить результат!
        </button>
      </div>
    </div>
  );
};
