import React, { useState } from 'react';
import { Layers, Check } from 'lucide-react';
import { BaseMapProvider, MAP_PROVIDERS } from '../../types/map';

interface LayerSwitchProps {
  currentProvider: BaseMapProvider;
  onSelectProvider: (provider: BaseMapProvider) => void;
}

export const LayerSwitch: React.FC<LayerSwitchProps> = ({
  currentProvider,
  onSelectProvider
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 shadow-xl transition-all active:scale-95"
        title="Сменить подложку карты"
      >
        <Layers className="w-4 h-4 text-sky-400" />
        <span className="hidden sm:inline">{MAP_PROVIDERS[currentProvider].name}</span>
        <span className="sm:hidden">{MAP_PROVIDERS[currentProvider].icon}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 p-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Выбор карты (Бесплатно)
          </div>
          {Object.values(MAP_PROVIDERS).map((provider) => {
            const isSelected = currentProvider === provider.id;
            return (
              <button
                key={provider.id}
                onClick={() => {
                  onSelectProvider(provider.id);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{provider.icon}</span>
                  <span>{provider.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
