import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Player, Manager, AuctionSettings, AuctionHistoryItem, FilterState, Role } from '../types';
import defaultPlayersRaw from '../data/defaultPlayers.json';
import defaultProbabiliRaw from '../data/defaultProbabili.json';
import { soundManager } from '../utils/audio';
import { getCreditsFromPMA, sortPlayerList } from '../utils/calculations';
import { parseProbabiliAndInfortunatiHtml, ProbabiliResponse, ProbabiliPlayerInfo } from '../utils/probabiliScraper';
import confetti from 'canvas-confetti';

const defaultPlayers = defaultPlayersRaw as Player[];
const defaultProbabili = defaultProbabiliRaw as unknown as ProbabiliResponse;

const DEFAULT_SETTINGS: AuctionSettings = {
  name: 'Asta #1',
  mode: 'classic',
  trackingMode: 'solo_me',
  basePriceType: '1credito',
  totalBudget: 500,
  modDifesa: false,
  imbattibilitaPortiere: true,
  tipologiaAsta: 'chiamata',
  participantsCount: 8,
  rosterRequirements: {
    P: 3,
    D: 8,
    C: 8,
    A: 6
  }
};

const DEFAULT_FILTERS: FilterState = {
  search: '',
  role: 'ALL',
  team: 'ALL',
  slot: 'ALL',
  status: 'free',
  sortBy: 'slot',
  sortOrder: 'asc'
};

const DEFAULT_COLORS = [
  '#00f59b', // Mint green (User)
  '#38bdf8', // Sky blue
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#8b5cf6', // Violet
  '#06b6d4'  // Cyan
];

interface AuctionState {
  settings: AuctionSettings;
  managers: Manager[];
  players: Player[];
  selectedPlayerId: string | number | null;
  currentBid: number;
  history: AuctionHistoryItem[];
  isConfigured: boolean;
  soundEnabled: boolean;
  filters: FilterState;
  
  // UI State
  opponentsModalOpen: boolean;
  exportModalOpen: boolean;
  hotkeyHelpOpen: boolean;
  activeMobileTab: 'focus' | 'list' | 'roster' | 'opponents';

  // Probabili Formazioni State
  probabiliData: ProbabiliResponse | null;
  isSyncingProbabili: boolean;
  lastProbabiliSync: string | null;

  // Actions
  fetchProbabiliLive: () => Promise<void>;
  setSettings: (settings: Partial<AuctionSettings>) => void;
  initAuction: (settings: AuctionSettings, managerNames?: string[], customPlayers?: Player[]) => void;
  selectPlayer: (playerId: string | number) => void;
  setBid: (bid: number) => void;
  incrementBid: (amount: number) => void;
  assignCurrentPlayer: (managerId: string, customPrice?: number) => void;
  assignToGenericOpponent: (customPrice?: number) => void;
  markCurrentUnsold: () => void;
  undoLastAction: () => void;
  updateFilters: (partial: Partial<FilterState>) => void;
  resetAuction: () => void;
  toggleSound: () => void;
  setOpponentsModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setHotkeyHelpOpen: (open: boolean) => void;
  setActiveMobileTab: (tab: 'focus' | 'list' | 'roster' | 'opponents') => void;
  loadCustomPlayers: (players: Player[]) => void;
  selectNextPlayer: (direction?: 'next' | 'prev') => void;
  reintroduceAllUnsold: () => void;
  reintroducePlayer: (playerId: string | number) => void;
}

export const useAuctionStore = create<AuctionState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      managers: [],
      players: defaultPlayers,
      selectedPlayerId: defaultPlayers[0]?.id || null,
      currentBid: 1,
      history: [],
      isConfigured: false,
      soundEnabled: true,
      filters: DEFAULT_FILTERS,
      opponentsModalOpen: false,
      exportModalOpen: false,
      hotkeyHelpOpen: false,
      activeMobileTab: 'focus',
      probabiliData: defaultProbabili,
      isSyncingProbabili: false,
      lastProbabiliSync: defaultProbabili.updatedAt || new Date().toISOString(),

      fetchProbabiliLive: async () => {
        set({ isSyncingProbabili: true });
        try {
          const fetchWithFallback = async (endpoint: string, targetUrl: string) => {
            // 1. Try local proxy
            try {
              const res = await fetch(endpoint);
              if (res.ok) {
                const text = await res.text();
                if (text && text.length > 500) return text;
              }
            } catch {
              // ignore
            }
            // 2. Fallback to public CORS proxy
            try {
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
              const res = await fetch(proxyUrl);
              if (res.ok) {
                const text = await res.text();
                if (text && text.length > 500) return text;
              }
            } catch {
              // ignore
            }
            return '';
          };

          const [htmlProb, htmlInf] = await Promise.all([
            fetchWithFallback('/api/probabili', 'https://www.fantacalcio.it/probabili-formazioni-serie-a'),
            fetchWithFallback('/api/infortunati', 'https://www.fantacalcio.it/infortunati-serie-a')
          ]);

          if (htmlProb || htmlInf) {
            const parsed = parseProbabiliAndInfortunatiHtml(htmlProb, htmlInf);
            set({
              probabiliData: parsed,
              lastProbabiliSync: parsed.updatedAt,
              isSyncingProbabili: false
            });
            soundManager.playTick(1200);
            return;
          }
        } catch (err) {
          console.warn('Could not fetch live probabili/infortunati, using cached snapshot:', err);
        }
        set({ isSyncingProbabili: false });
      },

      setSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      initAuction: (settings, customNames, customPlayersList) => {
        const count = settings.participantsCount || 8;
        const managers: Manager[] = [];
        
        // Manager 0 is the User ("Io")
        const userName = customNames && customNames[0] ? customNames[0] : 'Io (Tu)';
        managers.push({
          id: 'mgr-0',
          name: userName,
          isUser: true,
          budget: settings.totalBudget,
          spent: 0,
          color: DEFAULT_COLORS[0],
          roster: { P: [], D: [], C: [], A: [] }
        });

        // Other managers
        for (let i = 1; i < count; i++) {
          const name = customNames && customNames[i] ? customNames[i] : `Avversario ${i}`;
          managers.push({
            id: `mgr-${i}`,
            name,
            isUser: false,
            budget: settings.totalBudget,
            spent: 0,
            color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
            roster: { P: [], D: [], C: [], A: [] }
          });
        }

        const rawList = customPlayersList && customPlayersList.length > 0 ? customPlayersList : defaultPlayers;
        const sortedList = sortPlayerList(rawList, settings.tipologiaAsta, settings.sortRules);
        
        // Clean any assignments
        const freshPlayers = sortedList.map((p) => ({
          ...p,
          assignedTo: null,
          purchasePrice: null,
          assignedAt: null
        }));

        set({
          settings,
          managers,
          players: freshPlayers,
          selectedPlayerId: freshPlayers[0]?.id || null,
          currentBid: 1,
          history: [],
          isConfigured: true
        });
      },

      selectPlayer: (playerId) => {
        const player = get().players.find((p) => String(p.id) === String(playerId));
        if (player) {
          soundManager.playTick(900);
          // Set initial base bid according to basePriceType or PMA
          let startBid = 1;
          const { basePriceType, totalBudget } = get().settings;
          if (basePriceType === 'draft' && player.pfc > 0) {
            startBid = getCreditsFromPMA(player.pfc, totalBudget);
          } else if (basePriceType === 'quotazione' && player.pma > 0) {
            startBid = getCreditsFromPMA(player.pma, totalBudget);
          }
          set({
            selectedPlayerId: playerId,
            currentBid: startBid
          });
        }
      },

      setBid: (bid) => {
        soundManager.playTick(1100);
        set({ currentBid: Math.max(1, bid) });
      },

      incrementBid: (amount) => {
        soundManager.playTick(750 + amount * 15);
        set((state) => ({ currentBid: Math.max(1, state.currentBid + amount) }));
      },

      assignCurrentPlayer: (managerId, customPrice) => {
        const state = get();
        const { selectedPlayerId, players, managers, currentBid, history } = state;
        const price = customPrice !== undefined ? customPrice : currentBid;

        const playerIndex = players.findIndex((p) => String(p.id) === String(selectedPlayerId));
        if (playerIndex === -1) return;

        const player = players[playerIndex];
        const managerIndex = managers.findIndex((m) => m.id === managerId);
        if (managerIndex === -1) return;

        const manager = managers[managerIndex];

        // Sound & Confetti feedback
        if (manager.isUser) {
          soundManager.playSuccessChime();
          // Trigger confetti celebration for winning a player!
          try {
            confetti({
              particleCount: player.slot <= 2 ? 100 : 45,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore
          }
        } else {
          soundManager.playGavel();
        }

        const updatedPlayer: Player = {
          ...player,
          assignedTo: managerId,
          purchasePrice: price,
          assignedAt: new Date().toISOString()
        };

        const updatedPlayers = [...players];
        updatedPlayers[playerIndex] = updatedPlayer;

        // Update manager roster and budget
        const updatedManagers = [...managers];
        const updatedManagerRoster = {
          ...manager.roster,
          [player.role]: [...manager.roster[player.role], updatedPlayer]
        };

        updatedManagers[managerIndex] = {
          ...manager,
          budget: Math.max(0, manager.budget - price),
          spent: manager.spent + price,
          roster: updatedManagerRoster
        };

        const historyItem: AuctionHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: Date.now(),
          playerId: player.id,
          playerName: player.name,
          playerRole: player.role,
          playerTeam: player.team,
          managerId: manager.id,
          managerName: manager.name,
          price,
          type: 'assignment'
        };

        // Automatically advance to next free player
        const nextFree = updatedPlayers.find(
          (p, idx) => idx > playerIndex && !p.assignedTo && p.assignedTo !== 'UNSOLD'
        ) || updatedPlayers.find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD');

        set({
          players: updatedPlayers,
          managers: updatedManagers,
          history: [historyItem, ...history],
          selectedPlayerId: nextFree ? nextFree.id : selectedPlayerId,
          currentBid: 1
        });
      },

      assignToGenericOpponent: (customPrice?: number) => {
        const state = get();
        const { selectedPlayerId, players, history, currentBid } = state;
        const playerIndex = players.findIndex((p) => String(p.id) === String(selectedPlayerId));
        if (playerIndex === -1) return;

        const player = players[playerIndex];
        const price = customPrice !== undefined ? customPrice : currentBid;

        soundManager.playGavel();

        const updatedPlayer: Player = {
          ...player,
          assignedTo: 'OPPONENT',
          purchasePrice: price,
          assignedAt: new Date().toISOString()
        };

        const updatedPlayers = [...players];
        updatedPlayers[playerIndex] = updatedPlayer;

        const historyItem: AuctionHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: Date.now(),
          playerId: player.id,
          playerName: player.name,
          playerRole: player.role,
          playerTeam: player.team,
          managerId: 'OPPONENT',
          managerName: 'Avversario',
          price,
          type: 'assignment'
        };

        // Automatically advance to next free player
        const nextFree = updatedPlayers.find(
          (p, idx) => idx > playerIndex && !p.assignedTo && p.assignedTo !== 'UNSOLD'
        ) || updatedPlayers.find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD');

        set({
          players: updatedPlayers,
          history: [historyItem, ...history],
          selectedPlayerId: nextFree ? nextFree.id : selectedPlayerId,
          currentBid: 1
        });
      },

      markCurrentUnsold: () => {
        const state = get();
        const { selectedPlayerId, players, history } = state;
        const playerIndex = players.findIndex((p) => String(p.id) === String(selectedPlayerId));
        if (playerIndex === -1) return;

        const player = players[playerIndex];
        soundManager.playSkip();

        const updatedPlayer: Player = {
          ...player,
          assignedTo: 'UNSOLD',
          purchasePrice: 0,
          assignedAt: new Date().toISOString()
        };

        const updatedPlayers = [...players];
        updatedPlayers[playerIndex] = updatedPlayer;

        const historyItem: AuctionHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          timestamp: Date.now(),
          playerId: player.id,
          playerName: player.name,
          playerRole: player.role,
          playerTeam: player.team,
          managerId: 'UNSOLD',
          managerName: 'Invenduto',
          price: 0,
          type: 'unsold'
        };

        const nextFree = updatedPlayers.find(
          (p, idx) => idx > playerIndex && !p.assignedTo
        ) || updatedPlayers.find((p) => !p.assignedTo);

        set({
          players: updatedPlayers,
          history: [historyItem, ...history],
          selectedPlayerId: nextFree ? nextFree.id : selectedPlayerId,
          currentBid: 1
        });
      },

      undoLastAction: () => {
        const state = get();
        const { history, players, managers } = state;
        if (history.length === 0) return;

        soundManager.playUndo();
        const [lastAction, ...remainingHistory] = history;

        const playerIndex = players.findIndex((p) => String(p.id) === String(lastAction.playerId));
        if (playerIndex === -1) return;

        const updatedPlayers = [...players];
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          assignedTo: null,
          purchasePrice: null,
          assignedAt: null
        };

        let updatedManagers = [...managers];
        if (lastAction.type === 'assignment') {
          const managerIndex = managers.findIndex((m) => m.id === lastAction.managerId);
          if (managerIndex !== -1) {
            const manager = managers[managerIndex];
            const role = lastAction.playerRole;
            const updatedRoster = {
              ...manager.roster,
              [role]: manager.roster[role].filter((p) => String(p.id) !== String(lastAction.playerId))
            };
            updatedManagers[managerIndex] = {
              ...manager,
              budget: manager.budget + lastAction.price,
              spent: manager.spent - lastAction.price,
              roster: updatedRoster
            };
          }
        }

        set({
          players: updatedPlayers,
          managers: updatedManagers,
          history: remainingHistory,
          selectedPlayerId: lastAction.playerId,
          currentBid: lastAction.price > 0 ? lastAction.price : 1
        });
      },

      updateFilters: (partial) => {
        set((state) => ({
          filters: { ...state.filters, ...partial }
        }));
      },

      resetAuction: () => {
        set({
          isConfigured: false,
          history: [],
          selectedPlayerId: null,
          currentBid: 1
        });
      },

      toggleSound: () => {
        const next = !get().soundEnabled;
        soundManager.setEnabled(next);
        set({ soundEnabled: next });
      },

      setOpponentsModalOpen: (open) => set({ opponentsModalOpen: open }),
      setExportModalOpen: (open) => set({ exportModalOpen: open }),
      setHotkeyHelpOpen: (open) => set({ hotkeyHelpOpen: open }),
      setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),

      loadCustomPlayers: (players) => {
        const sorted = sortPlayerList(players, get().settings.tipologiaAsta, get().settings.sortRules);
        set({
          players: sorted,
          selectedPlayerId: sorted[0]?.id || null
        });
      },

      selectNextPlayer: (direction = 'next') => {
        const { players, selectedPlayerId } = get();
        if (players.length === 0) return;

        const currentIndex = players.findIndex((p) => String(p.id) === String(selectedPlayerId));
        if (currentIndex === -1) {
          const firstFree = players.find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD') || players[0];
          get().selectPlayer(firstFree.id);
          return;
        }

        // Find next / previous free player in list sequence
        if (direction === 'next') {
          const nextFree = players.slice(currentIndex + 1).find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD')
            || players.find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD')
            || (currentIndex < players.length - 1 ? players[currentIndex + 1] : players[0]);
          if (nextFree) get().selectPlayer(nextFree.id);
        } else {
          const prevFree = [...players.slice(0, currentIndex)].reverse().find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD')
            || [...players].reverse().find((p) => !p.assignedTo && p.assignedTo !== 'UNSOLD')
            || (currentIndex > 0 ? players[currentIndex - 1] : players[players.length - 1]);
          if (prevFree) get().selectPlayer(prevFree.id);
        }
      },

      reintroduceAllUnsold: () => {
        const { players } = get();
        const unsoldList = players.filter((p) => p.assignedTo === 'UNSOLD');
        if (unsoldList.length === 0) return;

        soundManager.playTick(1100);
        const updatedPlayers = players.map((p) => {
          if (p.assignedTo === 'UNSOLD') {
            return {
              ...p,
              assignedTo: null,
              purchasePrice: null,
              assignedAt: null
            };
          }
          return p;
        });

        const firstReintroduced = updatedPlayers.find((p) => String(p.id) === String(unsoldList[0].id));

        set({
          players: updatedPlayers,
          selectedPlayerId: firstReintroduced ? firstReintroduced.id : get().selectedPlayerId,
          currentBid: 1,
          filters: { ...get().filters, status: 'free' }
        });
      },

      reintroducePlayer: (playerId) => {
        const { players } = get();
        const updatedPlayers = players.map((p) => {
          if (String(p.id) === String(playerId)) {
            return {
              ...p,
              assignedTo: null,
              purchasePrice: null,
              assignedAt: null
            };
          }
          return p;
        });

        soundManager.playTick(1000);
        set({
          players: updatedPlayers,
          selectedPlayerId: playerId,
          currentBid: 1
        });
      }
    }),
    {
      name: 'fantalive_companion_storage_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        managers: state.managers,
        players: state.players,
        selectedPlayerId: state.selectedPlayerId,
        history: state.history,
        isConfigured: state.isConfigured,
        soundEnabled: state.soundEnabled
      })
    }
  )
);
