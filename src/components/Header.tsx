import React from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { 
  Volume2, 
  VolumeX, 
  Users, 
  Download, 
  HelpCircle, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Coins,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  Smartphone
} from 'lucide-react';
import { getMaxBid, getTotalRemainingSlots, getAverageBudgetPerRemainingSlot } from '../utils/calculations';

export const Header: React.FC = () => {
  const { 
    settings, 
    managers, 
    soundEnabled, 
    toggleSound, 
    setOpponentsModalOpen, 
    setExportModalOpen, 
    setHotkeyHelpOpen,
    resetAuction,
    activeMobileTab,
    setActiveMobileTab,
    probabiliData,
    fetchProbabiliLive,
    isSyncingProbabili
  } = useAuctionStore();

  const user = managers.find((m) => m.isUser) || managers[0];
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        alert('Per installare come app su iPhone/iPad:\n1. Tocca il tasto Condividi 📤 in basso in Safari\n2. Scorri e tocca "Aggiungi alla schermata Home" ➕');
      } else {
        alert('Per installare l\'app:\nApri il menu del browser (⋮ in alto a destra) e seleziona "Installa app" o "Aggiungi a schermata Home".');
      }
    }
  };

  const totalRequiredSlots = Object.values(settings.rosterRequirements).reduce((a, b) => a + b, 0);
  const userSlotsRemaining = user ? getTotalRemainingSlots(user, settings.rosterRequirements) : 0;
  const userSlotsFilled = totalRequiredSlots - userSlotsRemaining;
  const maxBid = user ? getMaxBid(user, settings.rosterRequirements) : 0;
  const avgSlotBudget = user ? getAverageBudgetPerRemainingSlot(user, settings.rosterRequirements) : 0;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="bg-[#0f0c29]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xl shadow-black/40">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: App Brand & Auction Info */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f59b] to-[#00b4d8] flex items-center justify-center text-black font-black text-lg shadow-md shadow-emerald-500/20">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {settings.name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  {settings.mode}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#00f59b]/20 border border-[#00f59b]/30 text-[#00f59b] text-[10px] font-bold tracking-wider">
                  {settings.totalBudget} FM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {settings.participantsCount} Partecipanti • Base {settings.basePriceType}
              </p>
            </div>
          </div>

          {/* Mobile Right Controls Quick Access */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs transition ${
                soundEnabled 
                  ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title="Suoni"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition"
              title="Esporta"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm("Vuoi davvero reimpostare l'asta o cambiare impostazioni?")) {
                  resetAuction();
                }
              }}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 transition"
              title="Setup"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Live User Budget Status Dashboard (GLANCEABLE BIG STATS) */}
        {user && (
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 bg-[#17133f] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-white/10 shadow-inner">
            
            {/* Budget Residuo */}
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3 h-3 text-[#00f59b] hidden sm:inline" />
                Residuo
              </span>
              <div className="text-base sm:text-2xl font-black text-[#00f59b] font-mono leading-none tracking-tight">
                {user.budget} <span className="text-[10px] sm:text-xs text-[#00f59b]/70 font-sans font-bold">FM</span>
              </div>
            </div>

            {/* Potere d'Acquisto Max */}
            <div className="flex flex-col items-center sm:items-start border-l border-white/10 pl-2 sm:pl-3">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-400 hidden sm:inline" />
                Max Offerta
              </span>
              <div className="text-base sm:text-2xl font-black text-cyan-300 font-mono leading-none tracking-tight">
                {maxBid} <span className="text-[10px] sm:text-xs text-cyan-300/70 font-sans font-bold">FM</span>
              </div>
            </div>

            {/* Slot Completati */}
            <div className="flex flex-col items-center sm:items-start border-l border-white/10 pl-2 sm:pl-3">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400 hidden sm:inline" />
                Rosa
              </span>
              <div className="text-base sm:text-2xl font-black text-amber-300 font-mono leading-none tracking-tight">
                {userSlotsFilled}<span className="text-xs sm:text-sm text-slate-400 font-bold">/{totalRequiredSlots}</span>
              </div>
            </div>

            {/* Spesa Media Slot */}
            <div className="flex flex-col items-center sm:items-start border-l border-white/10 pl-2 sm:pl-3">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-400 hidden sm:inline" />
                Media/Slot
              </span>
              <div className="text-base sm:text-2xl font-black text-purple-300 font-mono leading-none tracking-tight">
                {avgSlotBudget} <span className="text-[10px] sm:text-xs text-purple-300/70 font-sans font-bold">FM</span>
              </div>
            </div>

          </div>
        )}

        {/* Right: Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* Live Probabili Fantacalcio.it Refresh Button */}
          <button
            onClick={fetchProbabiliLive}
            disabled={isSyncingProbabili}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isSyncingProbabili 
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 animate-pulse'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
            }`}
            title="Aggiorna probabili formazioni in tempo reale da Fantacalcio.it"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSyncingProbabili ? 'animate-spin' : 'text-[#00f59b]'}`} />
            <span>{isSyncingProbabili ? 'Sincronizzazione...' : (probabiliData?.matchweek ? `Probabili ${probabiliData.matchweek}` : 'Probabili Live')}</span>
          </button>

          {/* Tabellone Avversari Modal Button */}
          <button
            onClick={() => setOpponentsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#211a54] hover:bg-[#2c2370] border border-purple-500/30 text-purple-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Tabellone Completo</span>
          </button>

          {/* PWA Install Button */}
          <button
            onClick={handleInstallPwa}
            className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Installa come Web App (PWA)"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden lg:inline">Installa App</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            title="Esporta risultati asta in Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Esporta</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled 
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Disattiva effetti sonori' : 'Attiva effetti sonori'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
            title="Schermo intero"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Hotkey Help */}
          <button
            onClick={() => setHotkeyHelpOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-[#00f59b] transition"
            title="Scorciatoie da tastiera"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings / Reset */}
          <button
            onClick={() => {
              if (window.confirm("Vuoi reimpostare l'asta e tornare alla schermata di configurazione?")) {
                resetAuction();
              }
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition"
            title="Configura / Nuova Asta"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Mobile Tab Navigation bar (Sticky under header on phones) */}
      <div className="flex md:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-white/10 text-xs font-bold">
        <button
          onClick={() => setActiveMobileTab('focus')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeMobileTab === 'focus'
              ? 'bg-[#00f59b] text-black font-black'
              : 'bg-white/5 text-slate-300'
          }`}
        >
          Battuta Live
        </button>
        <button
          onClick={() => setActiveMobileTab('list')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeMobileTab === 'list'
              ? 'bg-[#00f59b] text-black font-black'
              : 'bg-white/5 text-slate-300'
          }`}
        >
          Listone
        </button>
        <button
          onClick={() => setActiveMobileTab('roster')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeMobileTab === 'roster'
              ? 'bg-[#00f59b] text-black font-black'
              : 'bg-white/5 text-slate-300'
          }`}
        >
          Mia Rosa
        </button>
        <button
          onClick={() => setActiveMobileTab('opponents')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${
            activeMobileTab === 'opponents'
              ? 'bg-[#00f59b] text-black font-black'
              : 'bg-white/5 text-slate-300'
          }`}
        >
          Avversari
        </button>
      </div>

    </header>
  );
};
