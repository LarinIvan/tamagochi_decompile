import React from 'react';
import { X, Trophy, Swords, RotateCcw, ShieldCheck, Bone, Sparkles } from 'lucide-react';
import { FACTIONS } from '../../types/user';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl shadow-xl">
            🐾
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">В чем смысл игры?</h2>
            <div className="text-xs text-sky-400 font-medium">
              Правила битвы за микрорайон «След Лапы»
            </div>
          </div>
        </div>

        {/* 1. Зачем нужны гексагоны */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Trophy className="w-4 h-4" />
            1. Зачем город разбит на соты-гексагоны?
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Каждый гексагон — это ячейка карты размером около <b>100 метров</b> (размер типичного двора между домами, сквера или собачьей площадки).
            Гуляя с собакой, вы <b>«метите» территорию своим запахом</b> (в игре это <b>Очки Запаха — SP</b>) и закрашиваете соты в цвет вашей стаи!
          </p>
        </div>

        {/* 2. Три команды (Фракции) */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
            <Swords className="w-4 h-4" />
            2. Команды и коалиции собак
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Все собаки города делятся на 3 глобальные коалиции. Ваша цель — сделать так, чтобы ваш двор и весь жилой комплекс был окрашен в цвет вашей стаи:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
            {Object.values(FACTIONS).map((f) => (
              <div
                key={f.id}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col gap-1 text-center"
              >
                <span className="text-2xl">{f.symbol}</span>
                <span className="text-xs font-bold" style={{ color: f.borderColor }}>
                  {f.name}
                </span>
                <span className="text-[10px] text-slate-400">{f.bonusTitle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Как захватывать и отбивать соты */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            3. Как происходит захват территории
          </div>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <b>Прямой проход:</b> Вы просто идете с собакой через соту. Если сота ничейная — она становится вашей (+10 косточек). Если там чужой запах соседа — вы сбиваете его очки, пока сота не перейдет вам!
            </li>
            <li>
              <b>🔄 Замыкание контура (Супер-механика):</b> Если вы обошли свой квартал или дом по кругу и замкнули контур — <b>ВСЕ соты внутри периметра автоматически становятся вашими</b> со статусом «Закрытый двор» (+100 SP к защите)!
            </li>
            <li>
              <b>Затухание (Decay):</b> Запах выветривается: каждые 24 часа соты теряют 33% очков. Если 3 дня не гулять в своем сквере — он снова станет серым, и соседи его заберут.
            </li>
          </ul>
        </div>

        {/* 4. Награды и безопасность */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
            <ShieldCheck className="w-4 h-4" />
            4. Косточки и радар безопасности
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            За каждый пройденный километр и захваченную соту вы получаете <b>«Сахарные косточки» 🦴</b> для прокачки ранга собаки и кастомизации. 
            А метки <b>«Отрава»</b> и <b>«Битое стекло»</b> предупреждают вас звуковой сиреной в кармане за 50 метров, защищая лапы питомца!
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm rounded-2xl transition-all shadow-xl active:scale-98"
        >
          Понятно, идем захватывать район! 🐾
        </button>
      </div>
    </div>
  );
};
