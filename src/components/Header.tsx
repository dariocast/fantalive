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
  Smartphone,
  Settings2
} from 'lucide-react';
import { getMaxBid, getTotalRemainingSlots, getAverageBudgetPerRemainingSlot, getRoleColor } from '../utils/calculations';

export const Header: React.FC = () => {
  const { 
    settings, 
    managers, 
    players,
    selectedPlayerId,
    currentBid,
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
  const activePlayer = players.find((p) => String(p.id) === String(selectedPlayerId));
  const roleStyle = activePlayer ? getRoleColor(activePlayer.role) : null;
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

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
    <header className="bg-[#0f0c29]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-3 sm:px-6 py-2 shadow-xl shadow-black/40">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: App Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#00f59b] to-[#00b4d8] flex items-center justify-center text-black font-black text-base sm:text-lg shadow-md shadow-emerald-500/20">
            ⚽
          </div>
          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight hidden xs:inline truncate max-w-[120px] sm:max-w-[180px]">
            {settings.name || 'FantaLive'}
          </span>
        </div>

        {/* Center-Left: Active Player Spotlight Capsule (Always Visible) */}
        {activePlayer && (
          <div 
            onClick={() => setActiveMobileTab('focus')}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-gradient-to-r from-[#1c164a] to-[#251e60] border border-[#00f59b]/50 shadow-md cursor-pointer active:scale-95 transition min-w-0 flex-1 max-w-[280px] sm:max-w-[340px]"
            title="Calciatore in battuta - Clicca per scheda live"
          >
            {roleStyle && (
              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${roleStyle.badge}`}>
                {activePlayer.role}
              </span>
            )}
            <div className="min-w-0 flex-1 truncate">
              <span className="font-black text-xs sm:text-sm text-white truncate block">
                {activePlayer.name}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold truncate hidden sm:inline">
              {activePlayer.team}
            </span>
            <span className="text-xs font-mono font-black text-[#00f59b] shrink-0 pl-1 border-l border-white/15">
              {currentBid} FM
            </span>
          </div>
        )}

        {/* Center-Right: Budget & Squad Status */}
        {user && (
          <div className="hidden lg:flex items-center gap-3 bg-[#17133f] px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-inner text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <Coins className="w-3.5 h-3.5 text-[#00f59b]" />
              <span className="text-slate-400">Residuo:</span>
              <span className="text-sm font-black text-[#00f59b] font-mono">{user.budget} FM</span>
            </div>
            <div className="border-l border-white/10 pl-3 flex items-center gap-1.5 font-bold">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Max Bid:</span>
              <span className="text-sm font-black text-cyan-300 font-mono">{maxBid} FM</span>
            </div>
            <div className="border-l border-white/10 pl-3 flex items-center gap-1.5 font-bold">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Rosa:</span>
              <span className="text-sm font-black text-amber-300 font-mono">{userSlotsFilled}/{totalRequiredSlots}</span>
            </div>
          </div>
        )}

        {/* Right: Settings Menu Button & Desktop Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0 relative">
          
          {/* Quick Probabili Refresh on desktop */}
          <button
            onClick={fetchProbabiliLive}
            disabled={isSyncingProbabili}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
              isSyncingProbabili 
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 animate-pulse'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
            }`}
            title="Aggiorna formazioni ed infortuni"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSyncingProbabili ? 'animate-spin' : 'text-[#00f59b]'}`} />
            <span>{isSyncingProbabili ? 'Sync...' : (probabiliData?.matchweek ? probabiliData.matchweek : 'Probabili')}</span>
          </button>

          {/* MAIN SETTINGS & ACTIONS DROPDOWN BUTTON (ICON ONLY ON MOBILE) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              isMenuOpen 
                ? 'bg-[#00f59b] text-black border-[#00f59b] shadow-lg shadow-emerald-500/20' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
            }`}
            title="Menu Impostazioni & Funzioni"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden md:inline">Impostazioni</span>
          </button>

          {/* DROPDOWN POPUP MENU */}
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" 
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu Card */}
              <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 bg-[#15103d] border border-white/15 rounded-3xl p-3 shadow-2xl shadow-black/80 space-y-1.5 text-sm">
                
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                    Menu & Strumenti
                  </span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Probabili Live Sync */}
                <button
                  onClick={() => {
                    fetchProbabiliLive();
                    setIsMenuOpen(false);
                  }}
                  disabled={isSyncingProbabili}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#00f59b]" />
                    <span className="font-semibold text-xs sm:text-sm">Sincronizza Probabili & Infortunati</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Live</span>
                </button>

                {/* 2. Full League Modal */}
                <button
                  onClick={() => {
                    setOpponentsModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-xs sm:text-sm">Tabellone Completo Rose</span>
                  </div>
                </button>

                {/* 3. Export Modal */}
                <button
                  onClick={() => {
                    setExportModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-xs sm:text-sm">Esporta Risultati (Excel/CSV)</span>
                  </div>
                </button>

                {/* 4. Install App PWA */}
                <button
                  onClick={() => {
                    handleInstallPwa();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-xs sm:text-sm">Installa come App (PWA)</span>
                  </div>
                </button>

                {/* 5. Sound Toggle */}
                <button
                  onClick={toggleSound}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span className="font-semibold text-xs sm:text-sm">Effetti Sonori</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${soundEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-400'}`}>
                    {soundEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 6. Fullscreen */}
                <button
                  onClick={() => {
                    toggleFullscreen();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-300" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
                    <span className="font-semibold text-xs sm:text-sm">{isFullscreen ? 'Esci da Schermo Intero' : 'Schermo Intero'}</span>
                  </div>
                </button>

                {/* 7. Hotkey Help */}
                <button
                  onClick={() => {
                    setHotkeyHelpOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-white/5 text-left flex items-center justify-between text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-xs sm:text-sm">Scorciatoie da Tastiera</span>
                  </div>
                </button>

                {/* Divider */}
                <div className="border-t border-white/10 pt-1">
                  {/* 8. Reset / New Auction */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (window.confirm("Vuoi davvero reimpostare l'asta o cambiare impostazioni?")) {
                        resetAuction();
                      }
                    }}
                    className="w-full px-3 py-2 rounded-2xl hover:bg-rose-500/20 text-left flex items-center gap-2.5 text-rose-400 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-semibold text-xs sm:text-sm">Reimposta Asta / Setup</span>
                  </button>
                </div>

              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};
