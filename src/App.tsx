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
  const { isConfigured, activeMobileTab } = useAuctionStore();

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
        <div className="block lg:hidden h-[calc(100vh-130px)]">
          {activeMobileTab === 'focus' && <PlayerFocusCard />}
          {activeMobileTab === 'list' && <PlayerList />}
          {(activeMobileTab === 'roster' || activeMobileTab === 'opponents') && <RosterAndOpponents />}
        </div>

      </main>

      {/* Floating Modals */}
      <OpponentsModal />
      <ExportModal />
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default App;
