import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Coordinates } from '../../types/map';
import { HazardMarker, HazardType, HAZARD_CONFIGS } from '../../types/safety';

interface HazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCoords: Coordinates;
  authorName: string;
  onAddHazard: (hazard: HazardMarker) => void;
}

export const HazardModal: React.FC<HazardModalProps> = ({
  isOpen,
  onClose,
  playerCoords,
  authorName,
  onAddHazard
}) => {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState<HazardType>('glass');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = HAZARD_CONFIGS[selectedType];
    const newHazard: HazardMarker = {
      id: `hazard_${Date.now()}`,
      authorId: 'player_me',
      authorName,
      type: selectedType,
      lat: playerCoords.lat,
      lng: playerCoords.lng,
      description: description.trim() || config.label,
      upvotes: 1,
      downvotes: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + config.ttlHours * 3600 * 1000
    };

    onAddHazard(newHazard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-lg font-bold text-white">Сообщить об опасности</h2>
        </div>

        <p className="text-xs text-slate-400">
          Метка появится на карте всех собачников района, а при приближении к ней на 50 метров сработает звуковой сигнал.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(HAZARD_CONFIGS).map((item) => (
              <button
                type="button"
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedType === item.type
                    ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-75'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[11px] font-bold leading-tight text-slate-200">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400">Подробности / ориентир</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: разбита бутылка возле урны"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 mt-1 focus:border-rose-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-98 mt-1"
          >
            ⚠️ Поставить метку на карте
          </button>
        </form>
      </div>
    </div>
  );
};
