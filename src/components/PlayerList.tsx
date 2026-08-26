import React, { useMemo, useRef, useEffect } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { Role, Player } from '../types';
import { getRoleColor, getTitolaritaColor, getCreditsFromPMA } from '../utils/calculations';
import { getPlayerProbabiliStatus } from '../utils/probabiliScraper';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Shuffle, 
  ChevronRight, 
  UserCheck,
  Zap,
  Activity,
  AlertTriangle,
  Check, 
  X, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';

export const PlayerList: React.FC = () => {
  const { 
    players, 
    selectedPlayerId, 
    selectPlayer, 
    filters, 
    updateFilters,
    managers,
    settings,
    probabiliData,
    reintroduceAllUnsold,
    currentBid,
    setActiveMobileTab
  } = useAuctionStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Focus search when pressing "/" or space outside inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.code === 'Space' && e.ctrlKey)) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll active item into view smoothly if selected
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedPlayerId]);

  // Unique teams list
  const teams = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.team) set.add(p.team);
    });
    return Array.from(set).sort();
  }, [players]);

  // Role counts
  const roleStats = useMemo(() => {
    const counts: Record<string, { total: number; free: number }> = {
      ALL: { total: players.length, free: players.filter((p) => !p.assignedTo).length },
      P: { total: 0, free: 0 },
      D: { total: 0, free: 0 },
      C: { total: 0, free: 0 },
      A: { total: 0, free: 0 }
    };
    players.forEach((p) => {
      if (counts[p.role]) {
        counts[p.role].total++;
        if (!p.assignedTo) counts[p.role].free++;
      }
    });
    return counts;
  }, [players]);

  // Filtered and Sorted players
  const filteredPlayers = useMemo(() => {
    let list = players.filter((p) => {
      // Role filter
      if (filters.role !== 'ALL' && p.role !== filters.role) return false;

      // Status filter
      if (filters.status === 'free' && p.assignedTo) return false;
      if (filters.status === 'assigned' && (!p.assignedTo || p.assignedTo === 'UNSOLD')) return false;
      if (filters.status === 'unsold' && p.assignedTo !== 'UNSOLD') return false;

      // Team filter
      if (filters.team !== 'ALL' && p.team !== filters.team) return false;

      // Slot filter
      if (filters.slot !== 'ALL' && p.slot !== Number(filters.slot)) return false;

      // Search query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchTeam = p.team.toLowerCase().includes(q) || (p.teamSlug && p.teamSlug.toLowerCase().includes(q));
        const matchMantra = p.roleMantra && p.roleMantra.toLowerCase().includes(q);
        if (!matchName && !matchTeam && !matchMantra) return false;
      }

      return true;
    });

    // Sorting
    const roleOrder: Record<Role, number> = { P: 1, D: 2, C: 3, A: 4 };

    list = [...list].sort((a, b) => {
      // If viewing ALL roles, prioritize role hierarchy (P -> D -> C -> A)
      if (filters.role === 'ALL') {
        const rA = roleOrder[a.role] || 99;
        const rB = roleOrder[b.role] || 99;
        if (rA !== rB) return rA - rB;
      }

      let comp = 0;
      switch (filters.sortBy) {
        case 'pma':
          comp = (b.pma || 0) - (a.pma || 0);
          break;
        case 'pfc':
          comp = (b.pfc || 0) - (a.pfc || 0);
          break;
        case 'fantamedia':
          comp = (b.expectedFantamedia || 0) - (a.expectedFantamedia || 0);
          break;
        case 'titolarita':
          comp = (b.expectedTitolarita || 0) - (a.expectedTitolarita || 0);
          break;
        case 'slot':
          comp = (a.slot || 8) - (b.slot || 8);
          if (comp === 0) comp = (b.pma || 0) - (a.pma || 0);
          break;
        case 'name':
        default:
          comp = a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
          break;
      }
      return filters.sortOrder === 'desc' && filters.sortBy === 'name' ? -comp : comp;
    });

    return list;
  }, [players, filters]);

  const handlePickRandomFree = () => {
    const freeList = players.filter((p) => !p.assignedTo && (filters.role === 'ALL' || p.role === filters.role));
    if (freeList.length > 0) {
      const randomIndex = Math.floor(Math.random() * freeList.length);
      selectPlayer(freeList[randomIndex].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#120e33]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/30">
      
      {/* Top Search & Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-white/10 space-y-3 bg-[#16123d]">
        
        {/* Pinned Active Player Mini-Card */}
        {(() => {
          const activePlayer = players.find((p) => String(p.id) === String(selectedPlayerId));
          if (!activePlayer) return null;
          return (
            <div 
              onClick={() => {
                selectPlayer(activePlayer.id);
                setActiveMobileTab('focus');
              }}
              className="p-2 px-3 rounded-2xl bg-[#1e184f] hover:bg-[#282068] border border-[#00f59b]/40 hover:border-[#00f59b] transition flex items-center justify-between cursor-pointer shadow-md"
              title="Clicca per aprire la scheda di battuta"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs">🎯</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">In Battuta:</span>
                <span className="text-xs font-black text-white truncate">{activePlayer.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">({activePlayer.team})</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-black text-[#00f59b] shrink-0">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                <span>{currentBid} FM</span>
              </div>
            </div>
          );
        })()}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Cerca calciatore o squadra (tasto /)..."
            className="w-full bg-[#1e194f] border border-white/10 focus:border-[#00f59b] focus:ring-1 focus:ring-[#00f59b] rounded-2xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none transition"
          />
          {filters.search && (
            <button
              onClick={() => updateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-white/10 hover:bg-white/20 text-slate-300 px-2 py-0.5 rounded-full transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Role Pills */}
        <div className="grid grid-cols-5 gap-1.5 text-xs font-bold">
          {(['ALL', 'P', 'D', 'C', 'A'] as const).map((r) => {
            const isSelected = filters.role === r;
            const stats = roleStats[r] || { total: 0, free: 0 };
            
            let bgClass = 'bg-[#1e194f] text-slate-300 hover:bg-[#282168] border-white/5';
            if (isSelected) {
              if (r === 'ALL') bgClass = 'bg-[#00f59b] text-black border-[#00f59b] shadow-md shadow-emerald-500/20';
              else if (r === 'P') bgClass = 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20';
              else if (r === 'D') bgClass = 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20';
              else if (r === 'C') bgClass = 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20';
              else if (r === 'A') bgClass = 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20';
            }

            return (
              <button
                key={r}
                type="button"
                onClick={() => updateFilters({ role: r })}
                className={`py-1.5 px-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${bgClass}`}
              >
                <span className="leading-tight">{r === 'ALL' ? 'TUTTI' : r}</span>
                <span className={`text-[10px] opacity-80 ${isSelected ? 'font-black' : 'font-normal'}`}>
                  {stats.free}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          
          {/* Status (Liberi / Tutti) */}
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value as any })}
            className="bg-[#1e194f] border border-white/10 rounded-xl px-2 py-1.5 text-slate-200 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="free">Solo Liberi</option>
            <option value="ALL">Tutti</option>
            <option value="assigned">Assegnati</option>
            <option value="unsold">Invenduti</option>
          </select>

          {/* Slot */}
          <select
            value={filters.slot}
            onChange={(e) => updateFilters({ slot: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) })}
            className="bg-[#1e194f] border border-white/10 rounded-xl px-2 py-1.5 text-slate-200 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="ALL">Tutti gli Slot</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>{s}° Slot</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
            className="bg-[#1e194f] border border-white/10 rounded-xl px-2 py-1.5 text-slate-200 outline-none text-xs font-medium cursor-pointer"
          >
            <option value="slot">Ordina: Slot</option>
            <option value="pma">Ordina: PMA ↓</option>
            <option value="pfc">Ordina: PFC ↓</option>
            <option value="fantamedia">Ordina: FM Prevista</option>
            <option value="titolarita">Ordina: Titolarità</option>
            <option value="name">Ordina: Alfabetico</option>
          </select>

        </div>

        {/* Action button: Chiamata Random / Quick Stats */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-slate-400">
            {filteredPlayers.length} calciatori trovati
          </span>

          <button
            onClick={handlePickRandomFree}
            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[11px] font-bold transition flex items-center gap-1.5"
            title="Seleziona un giocatore casuale tra quelli liberi"
          >
            <Shuffle className="w-3 h-3 text-[#00f59b]" />
            Chiama Random
          </button>
        </div>

      </div>

      {/* Scrollable Player List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filters.status === 'unsold' && filteredPlayers.length > 0 && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl mb-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-300">
              <span>{filteredPlayers.length} Calciatori Invenduti</span>
            </div>
            <button
              type="button"
              onClick={reintroduceAllUnsold}
              className="w-full py-2 rounded-xl bg-[#00f59b] hover:bg-[#00e28d] text-black font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Rimetti tutti in gioco per il nuovo giro</span>
            </button>
          </div>
        )}

        {filteredPlayers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Filter className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold">Nessun calciatore trovato</p>
            <p className="text-xs text-slate-500">Prova a modificare i filtri di ricerca</p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isSelected = String(player.id) === String(selectedPlayerId);
            const roleStyle = getRoleColor(player.role);
            const isAssigned = Boolean(player.assignedTo);
            const isUnsold = player.assignedTo === 'UNSOLD';
            const assignedManager = isAssigned && !isUnsold 
              ? managers.find((m) => m.id === player.assignedTo) 
              : null;
            const prob = getPlayerProbabiliStatus(player, probabiliData?.players || null);

            return (
              <div
                key={player.id}
                ref={isSelected ? activeItemRef : null}
                onClick={() => selectPlayer(player.id)}
                className={`group p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                  isSelected
                    ? 'bg-[#221c54] border-[#00f59b] ring-1 ring-[#00f59b]/40 shadow-lg shadow-emerald-950/40 scale-[1.01]'
                    : isAssigned
                    ? 'bg-[#130f30]/40 border-white/5 opacity-60 hover:opacity-90 hover:bg-[#1a1444]'
                    : 'bg-[#17133f]/70 hover:bg-[#1f1952] border-white/5 hover:border-white/15'
                }`}
              >
                
                {/* Left: Role Badge & Name & Team */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  
                  {/* Role Icon / Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${roleStyle.badge}`}
                  >
                    {player.role}
                  </div>

                  {/* Name & Team & Slot */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-extrabold text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {player.name}
                      </span>
                      {player.newArrival && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span className="truncate">{player.team}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">{player.slot}° Slot</span>
                      {player.penaltyProbability > 0 && (
                        <span className="text-amber-400 text-[10px] font-bold">⚽ Rig</span>
                      )}
                      {prob.status === 'titolare' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-[#00f59b] font-bold">
                          Tit
                        </span>
                      )}
                      {prob.status === 'ballottaggio' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Ball {prob.ballotPct || 50}%
                        </span>
                      )}
                      {prob.status === 'infortunato' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                          Inf
                        </span>
                      )}
                      {prob.status === 'squalificato' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-600/20 text-rose-400 font-bold">
                          Squ
                        </span>
                      )}
                      {prob.status === 'non_convocato' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/10 font-bold" title="Non presente nei convocati per questa giornata">
                          Non conv.
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right: Key Stats / Assigned Status */}
                <div className="text-right shrink-0">
                  {isAssigned ? (
                    isUnsold ? (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                        Invenduto
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-[#00f59b] font-mono">
                          {player.purchasePrice} FM
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                          {assignedManager?.name || 'Assegnato'}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-200 font-mono">
                          {getCreditsFromPMA(player.pma, settings.totalBudget)} FM
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400">FM: {player.expectedFantamedia}</span>
                        <span className={`px-1 py-0.2 rounded font-bold ${getTitolaritaColor(player.expectedTitolarita)}`}>
                          {player.expectedTitolarita}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
