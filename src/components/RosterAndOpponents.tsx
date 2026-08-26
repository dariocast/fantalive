import React, { useState } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { Role, Manager, Player } from '../types';
import { 
  getRoleColor, 
  getMaxBid, 
  getTotalRemainingSlots, 
  getRemainingSlotsForRole,
  getCreditsFromPMA
} from '../utils/calculations';
import { 
  Shield, 
  Users, 
  History, 
  Coins, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  AlertCircle,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  XCircle,
  Play
} from 'lucide-react';

export const RosterAndOpponents: React.FC = () => {
  const { 
    managers, 
    players,
    settings, 
    history, 
    selectPlayer, 
    undoLastAction,
    reintroduceAllUnsold,
    reintroducePlayer
  } = useAuctionStore();

  const [activeTab, setActiveTab] = useState<'my_roster' | 'opponents' | 'unsold' | 'feed'>('my_roster');
  const [unsoldRoleFilter, setUnsoldRoleFilter] = useState<'ALL' | Role>('ALL');

  const user = managers.find((m) => m.isUser) || managers[0];
  const opponents = managers.filter((m) => !m.isUser);

  const unsoldPlayers = players.filter((p) => p.assignedTo === 'UNSOLD');
  const filteredUnsold = unsoldPlayers.filter((p) => unsoldRoleFilter === 'ALL' || p.role === unsoldRoleFilter);

  // Calculate highest threat for Attackers
  const maxAttackerBudgetOpponent = [...opponents].sort((a, b) => b.budget - a.budget)[0];

  return (
    <div className="flex flex-col h-full bg-[#120e33]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/30">
      
      {/* Top Tab Bar (4 Tabs) */}
      <div className="p-1.5 sm:p-2 bg-[#16123d] border-b border-white/10 grid grid-cols-4 gap-1 text-[11px] sm:text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('my_roster')}
          className={`py-2 px-1 rounded-xl text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'my_roster'
              ? 'bg-[#00f59b] text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-slate-300 hover:bg-[#201a52]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="truncate">Rosa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('opponents')}
          className={`py-2 px-1 rounded-xl text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'opponents'
              ? 'bg-[#00f59b] text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-slate-300 hover:bg-[#201a52]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="truncate">Avversari</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unsold')}
          className={`py-2 px-1 rounded-xl text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 relative ${
            activeTab === 'unsold'
              ? 'bg-[#00f59b] text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-slate-300 hover:bg-[#201a52]'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span className="truncate">Invenduti</span>
          {unsoldPlayers.length > 0 && (
            <span className={`text-[9px] px-1 py-0.1 rounded-full font-mono font-black ${
              activeTab === 'unsold' ? 'bg-black text-[#00f59b]' : 'bg-rose-500/80 text-white'
            }`}>
              {unsoldPlayers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`py-2 px-1 rounded-xl text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'feed'
              ? 'bg-[#00f59b] text-black shadow-md shadow-emerald-500/20 font-black'
              : 'text-slate-300 hover:bg-[#201a52]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span className="truncate">Feed</span>
        </button>
      </div>

      {/* Tab 1: LA MIA ROSA */}
      {activeTab === 'my_roster' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          
          {/* User Summary Card */}
          {user && (
            <div className="p-3.5 bg-[#1a1448] border border-white/10 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <div className="text-xs font-bold text-slate-400">Budget Speso</div>
                <div className="text-xl font-black text-white font-mono">
                  {user.spent} <span className="text-xs text-slate-400 font-sans">/ {settings.totalBudget} FM</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-400">Residuo</div>
                <div className="text-xl font-black text-[#00f59b] font-mono">
                  {user.budget} <span className="text-xs text-[#00f59b]/70 font-sans">FM</span>
                </div>
              </div>
            </div>
          )}

          {/* Roles Breakdown (P, D, C, A) */}
          {(['P', 'D', 'C', 'A'] as Role[]).map((role) => {
            const roleStyle = getRoleColor(role);
            const req = settings.rosterRequirements[role] || 0;
            const boughtPlayers = user ? user.roster[role] || [] : [];
            const count = boughtPlayers.length;
            const remaining = Math.max(0, req - count);
            const spentOnRole = boughtPlayers.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);

            const roleLabels: Record<Role, string> = {
              P: 'Portieri',
              D: 'Difensori',
              C: 'Centrocampisti',
              A: 'Attaccanti'
            };

            return (
              <div key={role} className="bg-[#17123f] p-3.5 rounded-2xl border border-white/10 space-y-2.5 shadow-sm">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${roleStyle.badge}`}>
                      {role}
                    </span>
                    <span className="font-extrabold text-sm text-white">{roleLabels[role]}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00f59b]">{spentOnRole} FM</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${count === req ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-300'}`}>
                      {count}/{req}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(count / req) * 100}%`,
                      backgroundColor: roleStyle.accent
                    }}
                  />
                </div>

                {/* Bought Players List */}
                {boughtPlayers.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {boughtPlayers.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => selectPlayer(p.id)}
                        className="p-2 rounded-xl bg-[#1e1752] hover:bg-[#281f6c] transition cursor-pointer flex items-center justify-between text-xs border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-slate-200 truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.team}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                            {p.slot}° sl
                          </span>
                        </div>
                        <span className="font-mono font-black text-[#00f59b] shrink-0">
                          {p.purchasePrice} FM
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-[11px] text-slate-500 italic">
                    Nessun calciatore acquistato ({remaining} slot mancanti)
                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}

      {/* Tab 2: TABELLONE AVVERSARI */}
      {activeTab === 'opponents' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          
          {/* Danger info */}
          {maxAttackerBudgetOpponent && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold">Attenzione:</span> {maxAttackerBudgetOpponent.name} ha il budget più alto ({maxAttackerBudgetOpponent.budget} FM)
              </div>
            </div>
          )}

          {/* All Managers Table Card */}
          {managers.map((mgr) => {
            const maxBid = getMaxBid(mgr, settings.rosterRequirements);
            const totalRemaining = getTotalRemainingSlots(mgr, settings.rosterRequirements);
            const totalSlots = Object.values(settings.rosterRequirements).reduce((a, b) => a + b, 0);

            return (
              <div
                key={mgr.id}
                className={`p-3 rounded-2xl border transition ${
                  mgr.isUser
                    ? 'bg-[#1e1752] border-[#00f59b]/60 shadow-md shadow-emerald-950/30'
                    : 'bg-[#16113e] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${mgr.isUser ? 'text-[#00f59b]' : 'text-slate-300'}`}>
                      {mgr.name}
                    </span>
                    {mgr.isUser && (
                      <span className="px-1.5 py-0.2 rounded bg-[#00f59b]/20 text-[#00f59b] text-[9px] font-black uppercase">
                        TU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[#00f59b]">{mgr.budget} FM</span>
                    <span className="text-[10px] text-slate-400">({mgr.spent} spesi)</span>
                  </div>
                </div>

                {/* Slots Breakdown per Role */}
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                  <div className="bg-amber-500/10 text-amber-300 py-1 rounded-lg border border-amber-500/20">
                    P: {mgr.roster.P.length}/{settings.rosterRequirements.P}
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-300 py-1 rounded-lg border border-emerald-500/20">
                    D: {mgr.roster.D.length}/{settings.rosterRequirements.D}
                  </div>
                  <div className="bg-blue-500/10 text-blue-300 py-1 rounded-lg border border-blue-500/20">
                    C: {mgr.roster.C.length}/{settings.rosterRequirements.C}
                  </div>
                  <div className="bg-rose-500/10 text-rose-300 py-1 rounded-lg border border-rose-500/20">
                    A: {mgr.roster.A.length}/{settings.rosterRequirements.A}
                  </div>
                </div>

                {/* Max Offerta */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[11px] text-slate-400">
                  <span>Max offerta per singolo calciatore:</span>
                  <span className="font-mono font-bold text-cyan-300">{maxBid} FM</span>
                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Tab 3: LISTA INVENDUTI DEDICATA (NUOVI GIRI D'ASTA) */}
      {activeTab === 'unsold' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          
          {/* Top Banner: Restore All Action */}
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  Lista Calciatori Invenduti
                </div>
                <div className="text-[11px] text-slate-400">
                  {unsoldPlayers.length} calciatori attualmente non assegnati
                </div>
              </div>
            </div>

            {unsoldPlayers.length > 0 && (
              <button
                type="button"
                onClick={reintroduceAllUnsold}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00f59b] to-[#00d984] hover:from-[#00e28d] hover:to-[#00c576] active:scale-95 text-[#090720] font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>RIMETTI TUTTI IN GIOCO ({unsoldPlayers.length} per Nuovo Giro)</span>
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="grid grid-cols-5 gap-1 text-[11px] font-bold">
            {(['ALL', 'P', 'D', 'C', 'A'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setUnsoldRoleFilter(r)}
                className={`py-1 rounded-lg text-center transition ${
                  unsoldRoleFilter === r
                    ? 'bg-[#00f59b] text-black font-black'
                    : 'bg-[#1b1548] text-slate-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'Tutti' : r}
              </button>
            ))}
          </div>

          {/* List of Unsold Players */}
          {filteredUnsold.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-1">
              <p className="font-semibold">Nessun calciatore invenduto in questa sezione.</p>
              <p className="text-[11px]">Tutti i calciatori sono attualmente liberi o assegnati.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredUnsold.map((p) => {
                const roleStyle = getRoleColor(p.role);
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-[#17123f] border border-white/10 hover:border-white/20 transition flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${roleStyle.badge}`}>
                        {p.role}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{p.team}</span>
                          <span>•</span>
                          <span>{p.slot}° Slot</span>
                          <span>•</span>
                          <span>PMA: {getCreditsFromPMA(p.pma, settings.totalBudget)} FM</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => reintroducePlayer(p.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-[10px] font-bold transition shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Rimetti questo calciatore in battuta"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Ribatti</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Tab 4: FEED LIVE / CRONOLOGIA */}
      {activeTab === 'feed' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Nessun evento ancora registrato.
            </div>
          ) : (
            history.map((item, idx) => {
              const roleStyle = getRoleColor(item.playerRole);
              const isUnsold = item.type === 'unsold';

              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-2xl bg-[#17123f] border border-white/10 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] ${roleStyle.badge}`}>
                      {item.playerRole}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{item.playerName}</div>
                      <div className="text-[10px] text-slate-400">
                        {isUnsold ? 'Non assegnato (Invenduto)' : `${item.managerName} (${item.playerTeam})`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className={`font-mono font-black ${isUnsold ? 'text-rose-400' : 'text-[#00f59b]'}`}>
                      {isUnsold ? '0 FM' : `${item.price} FM`}
                    </span>
                    
                    {idx === 0 && (
                      <button
                        onClick={undoLastAction}
                        className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition"
                        title="Annulla questo acquisto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
