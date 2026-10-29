import React, { useState } from 'react';
import { X, Plus, Shield, Award, MapPin } from 'lucide-react';
import { UserProfile, Dog } from '../../types/user';

interface UserProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenAddDog: () => void;
  onSelectDog: (dogId: string) => void;
  onEditDog: (dog: Dog) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSaveProfile,
  onOpenAddDog,
  onSelectDog,
  onEditDog
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio);
  const [district, setDistrict] = useState(profile.district);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      name,
      nickname,
      bio,
      district,
      avatarUrl
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500/50 shadow-md"
          />
          <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <div className="text-sm text-sky-400 font-medium">@{nickname}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {district}
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                Карма {profile.karma}
              </span>
            </div>
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="flex flex-col gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            О себе и график выгула
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="Когда и где вы обычно гуляете..."
          />

          <div className="grid grid-cols-2 gap-3 mt-1">
            <div>
              <label className="text-[11px] text-slate-400">Район / ЖК</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 mt-0.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Ссылка на аватар</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Список питомцев (Мульти-пет поддержка) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              Мои питомцы ({profile.dogs.length})
            </h3>
            <button
              onClick={onOpenAddDog}
              className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Добавить собаку
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.dogs.map((dog) => {
              const isSelected = dog.id === profile.selectedDogId;
              return (
                <div
                  key={dog.id}
                  onClick={() => onSelectDog(dog.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/30'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={dog.avatarUrl}
                      alt={dog.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm truncate">{dog.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-sky-500/20 text-sky-400 font-bold px-1.5 py-0.5 rounded-md">
                            На прогулке
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{dog.breed}</div>
                      <div className="text-[11px] text-amber-400 font-medium mt-0.5 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {dog.rank} (ур. {dog.level})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                    <span>{dog.totalKm} км выгула</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditDog(dog);
                      }}
                      className="text-sky-400 hover:underline font-semibold"
                    >
                      Настроить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Кнопка сохранить */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-98 mt-2"
        >
          Сохранить профиль
        </button>
      </div>
    </div>
  );
};
