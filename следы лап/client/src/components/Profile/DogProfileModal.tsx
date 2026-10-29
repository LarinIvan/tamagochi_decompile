import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Dog, FactionId, LeashColor, PawMarkerStyle, FACTIONS, LEASH_COLORS, MARKER_STYLES } from '../../types/user';

interface DogProfileModalProps {
  dog: Dog | null; // null = создание новой собаки
  isOpen: boolean;
  onClose: () => void;
  onSaveDog: (dog: Dog) => void;
}

const COMMON_BREEDS = [
  'Вельш-корги пемброк',
  'Померанский шпиц',
  'Сибирский хаски',
  'Немецкая овчарка',
  'Американский стаффордширский терьер',
  'Джек-рассел терьер',
  'Лабрадор-ретривер',
  'Французский бульдог',
  'Метис / Дворняга'
];

const HABIT_PRESETS = [
  'Любит догонялки',
  'Ищет друзей для игр',
  'Боится салютов',
  'Пищевик',
  'Тянет поводок',
  'Дружит со щенками',
  'Осторожно с кобелями',
  'В наморднике',
  'Знает трюки'
];

export const DogProfileModal: React.FC<DogProfileModalProps> = ({
  dog,
  isOpen,
  onClose,
  onSaveDog
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(dog?.name || '');
  const [breed, setBreed] = useState(dog?.breed || 'Вельш-корги пемброк');
  const [gender, setGender] = useState<'male' | 'female'>(dog?.gender || 'male');
  const [isNeutered, setIsNeutered] = useState(dog?.isNeutered ?? true);
  const [ageYears, setAgeYears] = useState(dog?.ageYears || 2);
  const [weightKg, setWeightKg] = useState(dog?.weightKg || 10);
  const [avatarUrl, setAvatarUrl] = useState(
    dog?.avatarUrl ||
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80'
  );
  const [faction, setFaction] = useState<FactionId>(dog?.faction || 'sprinters');
  const [leashColor, setLeashColor] = useState<LeashColor>(dog?.leashColor || 'green');
  const [markerStyle, setMarkerStyle] = useState<PawMarkerStyle>(dog?.markerStyle || 'corgi');
  const [habits, setHabits] = useState<string[]>(dog?.habits || ['Любит догонялки']);

  const toggleHabit = (habit: string) => {
    if (habits.includes(habit)) {
      setHabits(habits.filter((h) => h !== habit));
    } else {
      setHabits([...habits, habit]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: Dog = {
      id: dog?.id || `dog_${Date.now()}`,
      name,
      breed,
      gender,
      isNeutered,
      ageYears: Number(ageYears),
      weightKg: Number(weightKg),
      avatarUrl,
      faction,
      leashColor,
      markerStyle,
      habits,
      totalKm: dog?.totalKm || 0,
      totalHexes: dog?.totalHexes || 0,
      rank: dog?.rank || 'Щенок двора',
      level: dog?.level || 1,
      exp: dog?.exp || 0,
      sugarBones: dog?.sugarBones || 50
    };

    onSaveDog(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold">
          {dog ? `Редактирование: ${dog.name}` : 'Добавление новой собаки 🐾'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Кличка и порода */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Кличка *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, Тоби"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 mt-1 focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Порода *</label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 mt-1 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Быстрый выбор популярных пород */}
          <div className="flex flex-wrap gap-1.5">
            {COMMON_BREEDS.slice(0, 5).map((b) => (
              <button
                type="button"
                key={b}
                onClick={() => setBreed(b)}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                {b}
              </button>
            ))}
          </div>

          {/* Пол, стерилизация, возраст, вес */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Пол</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mt-1"
              >
                <option value="male">Кобель</option>
                <option value="female">Сука</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Стерилен</label>
              <select
                value={isNeutered ? 'yes' : 'no'}
                onChange={(e) => setIsNeutered(e.target.value === 'yes')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mt-1"
              >
                <option value="yes">Да</option>
                <option value="no">Нет</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Возраст (лет)</label>
              <input
                type="number"
                min="0.5"
                max="25"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Вес (кг)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mt-1"
              />
            </div>
          </div>

          {/* Выбор фракции */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Фракция питомца
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(FACTIONS).map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFaction(f.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    faction === f.id
                      ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70'
                  }`}
                >
                  <div className="text-base mb-1">{f.symbol}</div>
                  <div className="text-xs font-bold leading-tight">{f.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{f.bonusTitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Цвет поводка (Социальный радар) */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Цвет поводка на радаре «Кто рядом»
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(LEASH_COLORS).map((l) => (
                <button
                  type="button"
                  key={l.color}
                  onClick={() => setLeashColor(l.color)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    leashColor === l.color
                      ? 'bg-slate-800 border-slate-500 ring-2 ring-sky-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-80'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ background: l.bgColor }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{l.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{l.badge}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Кастомный маркер на карте */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Иконка маркера на карте
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MARKER_STYLES.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMarkerStyle(m.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    markerStyle === m.id
                      ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[9px] text-slate-300 mt-1 truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Повадки собаки */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Повадки и особенности
            </label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_PRESETS.map((h) => {
                const active = habits.includes(h);
                return (
                  <button
                    type="button"
                    key={h}
                    onClick={() => toggleHabit(h)}
                    className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                      active
                        ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ссылка на фото */}
          <div>
            <label className="text-[11px] text-slate-400">URL фотографии собаки</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mt-0.5"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-98 mt-2"
          >
            Сохранить питомца
          </button>
        </form>
      </div>
    </div>
  );
};
