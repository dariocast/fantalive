import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Zap, 
  WifiOff, 
  Maximize, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Smartphone, 
  Layers, 
  TrendingUp, 
  Coins 
} from 'lucide-react';
import { APP_VERSION } from '../version';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall: boolean;
  onPromptInstall: () => void;
  isIos: boolean;
  isInstalled: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  canInstall,
  onPromptInstall,
  isIos,
  isInstalled
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 5 seconds if modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const slides = [
    {
      badge: 'LIVE AUCTION',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'Asta Live a Latenza Zero',
      subtitle: 'Battuta istantanea con timer sincronizzato, rilanci rapidi +1/+5 FM e supporto audio.',
      mockup: (
        <div className="bg-[#120d33] p-4 rounded-2xl border border-emerald-500/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs">Pc</span>
              <span className="font-extrabold text-white text-sm">L. Martinez</span>
              <span className="text-xs text-slate-400">Inter</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">FVM: 145</span>
          </div>
          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Offerta Corrente</span>
              <span className="text-xl font-mono font-black text-[#00f59b]">185 FM</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Timer</span>
              <span className="text-sm font-mono font-extrabold text-rose-400 animate-pulse">00:03</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="py-1.5 rounded-xl bg-white/10 text-center font-bold text-xs text-slate-200 border border-white/15">+1 FM</div>
            <div className="py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center font-black text-xs text-black shadow-md shadow-emerald-500/20">+5 FM Rilancia</div>
          </div>
        </div>
      )
    },
    {
      badge: 'SMART BUDGET',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      title: 'Max Bid & Slot Calculation',
      subtitle: 'Algoritmo proprietario che calcola in tempo reale il budget massimo sicuro per non bucare la rosa.',
      mockup: (
        <div className="bg-[#120d33] p-4 rounded-2xl border border-cyan-500/30 shadow-lg space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[9px] uppercase text-slate-400 block font-bold">Residuo</span>
              <span className="text-sm font-mono font-black text-[#00f59b]">320 FM</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <span className="text-[9px] uppercase text-cyan-300 block font-bold">Max Bid</span>
              <span className="text-sm font-mono font-black text-cyan-300">296 FM</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-[9px] uppercase text-slate-400 block font-bold">Rosa</span>
              <span className="text-sm font-mono font-black text-amber-300">18/25</span>
            </div>
          </div>
          <div className="space-y-1.5 bg-black/30 p-2.5 rounded-xl border border-white/10 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Budget medio per slot libero:</span>
              <span className="font-mono font-bold text-emerald-400">45.7 FM</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-[72%]"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      badge: 'LIVE STATS',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      title: 'Probabili Formazioni & Listone',
      subtitle: 'Sincronizzazione live di titolari, ballottaggi, infortuni e quotazioni Serie A sempre a portata di tap.',
      mockup: (
        <div className="bg-[#120d33] p-4 rounded-2xl border border-purple-500/30 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-white">Probabili Giornata 1</span>
            </div>
            <span className="text-[10px] text-purple-300 font-mono">Live Sync</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-black text-[10px]">C</span>
                <span className="font-semibold text-slate-200">Pulisic</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">Titolare (90%)</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-black text-[10px]">D</span>
                <span className="font-semibold text-slate-200">Dimarco</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-400">Titolare (85%)</span>
            </div>
          </div>
        </div>
      )
    },
    {
      badge: 'NATIVE PWA',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      title: '100% Offline & A Schermo Intero',
      subtitle: 'Nessuna barra del browser che distrae, salvataggio locale automatico e zero consumo di giga.',
      mockup: (
        <div className="bg-[#120d33] p-4 rounded-2xl border border-amber-500/30 shadow-lg space-y-2.5">
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-black font-black">
              <WifiOff className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">Zero Dipendenza da Rete</span>
              <span className="text-[11px] text-slate-400 block">L\'asta prosegue fluida anche senza internet</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-black font-black">
              <Maximize className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-bold text-white text-xs block">Esperienza Immersiva Standalone</span>
              <span className="text-[11px] text-slate-400 block">Niente URL bar, niente refresh accidentali</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      
      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1c164a] via-[#140e38] to-[#0d0928] border border-white/20 rounded-3xl sm:rounded-[32px] shadow-2xl shadow-emerald-500/10 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7 space-y-5">
          
          {/* Header Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f59b] to-[#00b4d8] flex items-center justify-center text-black text-2xl font-black shadow-lg shadow-emerald-500/30">
                ⚽
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#1c164a] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-black" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">FantaLive Companion</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00f59b] text-[10px] font-extrabold uppercase">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Installazione istantanea • Nessun download dagli store
              </p>
            </div>
          </div>

          {/* Carousel Card */}
          <div className="relative bg-[#0c0824]/90 rounded-2xl p-4 sm:p-5 border border-white/10 shadow-inner">
            
            {/* Top Carousel Navigation Header */}
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-wider uppercase ${slides[currentSlide].badgeColor}`}>
                {slides[currentSlide].badge}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
                  title="Precedente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
                  title="Successivo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Title & Subtitle */}
            <div className="mb-4">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {slides[currentSlide].title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Live Interactive Mockup Slide */}
            <div className="min-h-[140px] flex flex-col justify-center transition-all duration-300">
              {slides[currentSlide].mockup}
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-2 border-t border-white/5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx ? 'w-6 bg-[#00f59b]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Vai alla slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

          {/* Quick Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Zero Latenza</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <WifiOff className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">100% Offline</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <Maximize className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Fullscreen</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-300 block">Zero Spazio</span>
            </div>
          </div>

          {/* Installation Action Area (Platform Aware) */}
          <div className="pt-2">
            {isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-[#00f59b] font-black text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>FantaLive è già installata sul tuo dispositivo!</span>
                </div>
                <p className="text-xs text-slate-300">
                  Puoi avviarla in qualsiasi momento dalla schermata Home per l'esperienza fullscreen.
                </p>
              </div>
            ) : isIos ? (
              /* iOS Safari Visual Guide */
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1442] to-[#251d5c] border border-cyan-500/40 space-y-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2 font-black text-white text-sm">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Come installare su iPhone / iPad (Safari)</span>
                </div>
                <ol className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0 border border-cyan-500/40">1</span>
                    <span>Tocca l'icona <strong>Condividi</strong> <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white font-bold"><Share className="w-3 h-3 inline mr-1" /> Condividi</span> nella barra inferiore di Safari.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0 border border-cyan-500/40">2</span>
                    <span>Scorri l'elenco e seleziona <strong>"Aggiungi alla schermata Home"</strong> <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-white font-bold"><PlusSquare className="w-3 h-3 inline mr-1" /> Aggiungi</span>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0 border border-cyan-500/40">3</span>
                    <span>Tocca <strong>"Aggiungi"</strong> in alto a destra per confermare.</span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Android Chrome / Desktop PWA Direct Trigger */
              <div className="space-y-2">
                <button
                  onClick={onPromptInstall}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00f59b] via-[#00e1a5] to-[#00b4d8] hover:from-[#00ffaa] hover:to-[#38bdf8] text-black font-black text-sm sm:text-base tracking-tight shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-5 h-5 fill-black" />
                  <span>Installa FantaLive come App</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  {canInstall 
                    ? 'Un solo tap per aggiungerla alla schermata Home senza passare da Play Store.' 
                    : 'Oppure apri il menu del browser (⋮ in alto a destra) e seleziona "Installa app".'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Dismiss Action */}
          <div className="text-center pt-1">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer font-semibold underline underline-offset-4"
            >
              Continua nel browser web
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
