import React, { useState } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { Role } from '../types';
import { getRoleColor, getMaxBid, getTotalRemainingSlots } from '../utils/calculations';
import { X, Users, Coins, Shield, Flame } from 'lucide-react';

export const OpponentsModal: React.FC = () => {
  const { 
    opponentsModalOpen, 
    setOpponentsModalOpen, 
    managers, 
    settings, 
    selectPlayer 
  } = useAuctionStore();

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | Role>('ALL');

  if (!opponentsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#140f3b] border border-white/15 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#191347]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00f59b] to-[#00b4d8] flex items-center justify-center text-black font-black text-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Tabellone Completo Rose & Avversari
              </h2>
              <p className="text-xs text-slate-400">
                Monitoraggio in tempo reale di tutti i {managers.length} partecipanti
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpponentsModalOpen(false)}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Pills inside Modal */}
        <div className="px-6 py-3 bg-[#171142] border-b border-white/5 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-2">Filtra Ruolo:</span>
          {(['ALL', 'P', 'D', 'C', 'A'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoleFilter(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                selectedRoleFilter === r
                  ? 'bg-[#00f59b] text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {r === 'ALL' ? 'Tutti i Ruoli' : r}
            </button>
          ))}
        </div>

        {/* Managers Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {managers.map((mgr) => {
            const maxBid = getMaxBid(mgr, settings.rosterRequirements);
            const totalRemaining = getTotalRemainingSlots(mgr, settings.rosterRequirements);
            const totalSlots = Object.values(settings.rosterRequirements).reduce((a, b) => a + b, 0);
            const totalFilled = totalSlots - totalRemaining;

            return (
              <div
                key={mgr.id}
                className={`p-4 rounded-3xl border flex flex-col justify-between ${
                  mgr.isUser
                    ? 'bg-[#1f1754] border-[#00f59b] shadow-lg shadow-emerald-950/40 ring-1 ring-[#00f59b]/50'
                    : 'bg-[#16113e] border-white/10'
                }`}
              >
                {/* Manager Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white">{mgr.name}</span>
                        {mgr.isUser && (
                          <span className="px-2 py-0.5 rounded-full bg-[#00f59b]/20 text-[#00f59b] text-[10px] font-black uppercase">
                            TU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {totalFilled}/{totalSlots} slot completati
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-[#00f59b] font-mono leading-none">
                        {mgr.budget} <span className="text-xs font-sans font-bold">FM</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Max Bid: <span className="text-cyan-300 font-mono font-bold">{maxBid} FM</span>
                      </div>
                    </div>
                  </div>

                  {/* Roster per role */}
                  <div className="py-3 space-y-3">
                    {(['P', 'D', 'C', 'A'] as Role[]).map((role) => {
                      if (selectedRoleFilter !== 'ALL' && selectedRoleFilter !== role) return null;
                      const roleStyle = getRoleColor(role);
                      const players = mgr.roster[role] || [];
                      const req = settings.rosterRequirements[role];

                      return (
                        <div key={role} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] ${roleStyle.badge}`}>
                                {role}
                              </span>
                              <span className="text-slate-300">{role} ({players.length}/{req})</span>
                            </span>
                            <span className="text-slate-400 font-mono">
                              {players.reduce((sum, p) => sum + (p.purchasePrice || 0), 0)} FM
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {players.length > 0 ? (
                              players.map((p) => (
                                <span
                                  key={p.id}
                                  onClick={() => {
                                    selectPlayer(p.id);
                                    setOpponentsModalOpen(false);
                                  }}
                                  className="px-2 py-0.5 rounded-lg bg-[#211956] hover:bg-[#2e2375] text-[11px] text-slate-200 border border-white/5 cursor-pointer transition flex items-center gap-1"
                                >
                                  <span>{p.name}</span>
                                  <span className="font-mono font-bold text-[#00f59b]">({p.purchasePrice})</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Nessun giocatore</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Spesa totale:</span>
                  <span className="font-mono font-bold text-white">{mgr.spent} FM</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
