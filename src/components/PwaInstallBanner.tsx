import React from 'react';
import { Sparkles, X, Download } from 'lucide-react';

interface PwaInstallBannerProps {
  isVisible: boolean;
  onOpenModal: () => void;
  onDismiss: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  isVisible,
  onOpenModal,
  onDismiss,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-slideDown">
      <div className="bg-gradient-to-r from-[#1b1448]/95 via-[#15103a]/95 to-[#1c124e]/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl shadow-emerald-500/20 flex items-center justify-between gap-3">
        
        {/* Left: App Icon & Text */}
        <div 
          onClick={onOpenModal}
          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f59b] to-[#00b4d8] flex items-center justify-center text-black font-black text-lg shrink-0 shadow-md shadow-emerald-500/30">
            ⚽
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white truncate">Installa FantaLive</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00f59b] font-black text-[9px] uppercase border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Asta a schermo intero e zero latenza
            </p>
          </div>
        </div>

        {/* Right: Install CTA & Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00f59b] to-[#00b4d8] text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installa</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Chiudi avviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
