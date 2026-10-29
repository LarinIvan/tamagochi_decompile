import React from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { HazardMarker, HAZARD_CONFIGS } from '../../types/safety';

interface HazardAlertBannerProps {
  hazard: HazardMarker | null;
  distanceMeters: number;
  onDismiss: () => void;
}

export const HazardAlertBanner: React.FC<HazardAlertBannerProps> = ({
  hazard,
  distanceMeters,
  onDismiss
}) => {
  if (!hazard) return null;

  const config = HAZARD_CONFIGS[hazard.type] || HAZARD_CONFIGS.glass;

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top duration-200">
      <div className="bg-rose-950/95 backdrop-blur-xl border-2 border-rose-500 rounded-3xl p-4 shadow-2xl flex items-start gap-3 text-slate-100 ring-4 ring-rose-500/20">
        <div className="p-2.5 bg-rose-600 rounded-2xl text-2xl shrink-0 animate-bounce">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-rose-200 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              ОПАСНОСТЬ РЯДОМ!
            </span>
            <span className="text-xs font-bold bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-lg">
              {Math.round(distanceMeters)} м
            </span>
          </div>
          <div className="text-xs font-bold text-white mt-0.5">{config.label}</div>
          <p className="text-[11px] text-rose-200/90 mt-1 line-clamp-2">{hazard.description}</p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-800/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
