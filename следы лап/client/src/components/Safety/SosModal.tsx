import React, { useState } from 'react';
import { X, Siren, Phone } from 'lucide-react';
import { Dog } from '../../types/user';
import { Coordinates } from '../../types/map';
import { SosAlert } from '../../types/safety';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: Dog;
  playerCoords: Coordinates;
  onSendSos: (alert: SosAlert) => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  dog,
  playerCoords,
  onSendSos
}) => {
  if (!isOpen) return null;

  const [phone, setPhone] = useState('+7 (999) 000-00-00');
  const [description, setDescription] = useState('Сорвался с поводка, испугавшись громкого звука! Помогите найти!');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const alert: SosAlert = {
      id: `sos_${Date.now()}`,
      dogId: dog.id,
      dogName: dog.name,
      breed: dog.breed,
      avatarUrl: dog.avatarUrl,
      ownerName: 'Хозяин',
      ownerPhone: phone,
      description,
      lat: playerCoords.lat,
      lng: playerCoords.lng,
      radiusKm: 1.5,
      createdAt: Date.now(),
      isActive: true
    };

    onSendSos(alert);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border-2 border-rose-600 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-500">
          <div className="p-3 bg-rose-500/20 rounded-2xl animate-pulse">
            <Siren className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">SOS: Пропала собака</h2>
            <div className="text-xs text-rose-400 font-medium">Оповещение в радиусе 1.5 км</div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <img
            src={dog.avatarUrl}
            alt={dog.name}
            className="w-12 h-12 rounded-xl object-cover border border-rose-500"
          />
          <div>
            <div className="font-bold text-sm text-white">{dog.name}</div>
            <div className="text-xs text-slate-400">{dog.breed}</div>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              Контактный телефон для очевидцев
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 mt-1 focus:border-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400">Обстоятельства и приметы</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 mt-1 focus:border-rose-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl active:scale-98 mt-2"
          >
            📢 РАЗОСЛАТЬ ЭКСТРЕННЫЙ ПУШ СОСЕДЯМ
          </button>
        </form>
      </div>
    </div>
  );
};
