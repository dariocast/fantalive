import React from 'react';
import { useAuctionStore } from './store/useAuctionStore';
import { SetupScreen } from './components/SetupScreen';
import { Header } from './components/Header';
import { PlayerList } from './components/PlayerList';
import { PlayerFocusCard } from './components/PlayerFocusCard';
import { RosterAndOpponents } from './components/RosterAndOpponents';
import { OpponentsModal } from './components/OpponentsModal';
import { ExportModal } from './components/ExportModal';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';

export const App: React.FC = () => {
  const { isConfigured, activeMobileTab, setActiveMobileTab, settings } = useAuctionStore();

  if (!isConfigured) {
    return <SetupScreen />;
  }

  return (
    <div className="min-h-screen bg-[#09081a] text-slate-100 flex flex-col selection:bg-[#00f59b] selection:text-black">
      {/* Top Bar Header */}
      <Header />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-2 sm:p-4 lg:p-5 overflow-hidden">
        
        {/* DESKTOP 3-COLUMN SPLIT LAYOUT */}
        <div className="hidden lg:grid grid-cols-12 gap-4 h-[calc(100vh-80px)]">
          {/* Left Column (30% -> col-span-3 or 4) */}
          <div className="col-span-3 h-full overflow-hidden">
            <PlayerList />
          </div>

          {/* Center Column (45% -> col-span-5 or 6) */}
          <div className="col-span-6 h-full overflow-hidden">
            <PlayerFocusCard />
          </div>

          {/* Right Column (25% -> col-span-3) */}
          <div className="col-span-3 h-full overflow-hidden">
            <RosterAndOpponents />
          </div>
        </div>

        {/* MOBILE / TABLET SINGLE COLUMN WITH TAB SWITCHING */}
        <div className="block lg:hidden h-[calc(100vh-140px)] pb-16">
          {activeMobileTab === 'focus' && <PlayerFocusCard />}
          {activeMobileTab === 'list' && <PlayerList />}
          {(activeMobileTab === 'roster' || activeMobileTab === 'opponents') && <RosterAndOpponents />}
        </div>

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#100c30]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          type="button"
          onClick={() => setActiveMobileTab('focus')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition cursor-pointer ${
            activeMobileTab === 'focus'
              ? 'text-[#00f59b] font-black'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}
        >
          <span className="text-lg">🎯</span>
          <span className="text-[11px]">Battuta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('list')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition cursor-pointer ${
            activeMobileTab === 'list'
              ? 'text-[#00f59b] font-black'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}
        >
          <span className="text-lg">📋</span>
          <span className="text-[11px]">Listone</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('roster')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition cursor-pointer ${
            activeMobileTab === 'roster'
              ? 'text-[#00f59b] font-black'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}
        >
          <span className="text-lg">🛡️</span>
          <span className="text-[11px]">Mia Rosa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileTab('opponents')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-2xl transition cursor-pointer ${
            activeMobileTab === 'opponents'
              ? 'text-[#00f59b] font-black'
              : 'text-slate-400 hover:text-white font-semibold'
          }`}
        >
          <span className="text-lg">{settings.trackingMode === 'solo_me' ? '🔄' : '👥'}</span>
          <span className="text-[11px]">{settings.trackingMode === 'solo_me' ? 'Invenduti' : 'Avversari'}</span>
        </button>
      </nav>

      {/* Floating Modals */}
      <OpponentsModal />
      <ExportModal />
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default App;
