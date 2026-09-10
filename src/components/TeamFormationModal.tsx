import React, { useMemo, useEffect } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { getTeamFormationDetails, getTeamProbabiliUrl, TeamFormationPlayer } from '../utils/probabiliScraper';
import { getRoleColor } from '../utils/calculations';
import { 
  X, 
  Activity, 
  Calendar, 
  Zap, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  Flame, 
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

export const TeamFormationModal: React.FC = () => {
  const { 
    formationModalTeam, 
    setFormationModalTeam, 
    probabiliData, 
    players, 
    selectedPlayerId, 
    selectPlayer,
    managers
  } = useAuctionStore();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && formationModalTeam) {
        setFormationModalTeam(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formationModalTeam, setFormationModalTeam]);

  // Unique list of all teams in roster
  const allTeams = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.team) set.add(p.team);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'it'));
  }, [players]);

  const formation = useMemo(() => {
    if (!formationModalTeam) return null;
    return getTeamFormationDetails(formationModalTeam, probabiliData, players);
  }, [formationModalTeam, probabiliData, players]);

  if (!formationModalTeam || !formation) return null;

  const handleSelectAndClose = (playerId: string | number) => {
    selectPlayer(playerId);
    setFormationModalTeam(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-[#120e33] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#171242] to-[#20195c] border-b border-white/10 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f59b] animate-ping" />
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#00f59b]/20 text-[#00f59b] border border-[#00f59b]/30">
                {formation.matchweek}
              </span>

              {/* Team Selector dropdown */}
              <select
                value={formationModalTeam}
                onChange={(e) => setFormationModalTeam(e.target.value)}
                className="bg-[#221a60] border border-white/20 text-white font-black text-sm sm:text-base rounded-xl px-2.5 py-1 outline-none cursor-pointer focus:border-[#00f59b]"
              >
                {allTeams.map((t) => (
                  <option key={t} value={t} className="bg-[#120e33] text-white">
                    {t.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Match & Date */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
              {formation.match && (
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {formation.match}
                </span>
              )}
              {formation.matchDate && (
                <span className="text-slate-400">({formation.matchDate})</span>
              )}
            </div>

          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getTeamProbabiliUrl(formationModalTeam)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition text-xs font-bold hidden sm:flex items-center gap-1.5"
              title="Apri su Fantacalcio.it"
            >
              <span>Fantacalcio.it</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#00f59b]" />
            </a>

            <button
              onClick={() => setFormationModalTeam(null)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              title="Chiudi (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* SECTION 1: TITOLARI PROBABILI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00f59b] fill-current" />
                <span>Probabile 11 Titolare ({formation.starters.length} in campo)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Clicca su un calciatore per chiamarlo in asta
              </span>
            </div>

            {formation.starters.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/5 text-center text-slate-400 text-xs">
                Nessuna formazione titolare comunicata al momento per questa squadra.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formation.starters.map((p) => {
                  const roleStyle = getRoleColor(p.role);
                  const isCurrent = String(p.id) === String(selectedPlayerId);
                  const isAssigned = Boolean(p.assignedTo);
                  const assignedManager = isAssigned && p.assignedTo !== 'UNSOLD'
                    ? managers.find((m) => m.id === p.assignedTo)
                    : null;

                  return (
                    <div
                      key={String(p.id)}
                      onClick={() => handleSelectAndClose(p.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'bg-[#251e60] border-[#00f59b] ring-1 ring-[#00f59b]/50 shadow-md shadow-emerald-950/40'
                          : 'bg-[#181342]/70 hover:bg-[#201a57] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${roleStyle.badge}`}>
                          {p.role}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black text-xs sm:text-sm truncate ${isCurrent ? 'text-[#00f59b]' : 'text-white group-hover:text-[#00f59b] transition-colors'}`}>
                              {p.name}
                            </span>
                            {p.roleMantra && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[9px] font-bold shrink-0">
                                {p.roleMantra}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded bg-[#00f59b] text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
                                In Battuta
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                            {p.slot && <span>{p.slot}° Slot</span>}
                            {p.pma !== undefined && p.pma > 0 && <span>PMA: {p.pma} FM</span>}
                            {isAssigned && (
                              <span className="text-emerald-400 font-bold">
                                {p.assignedTo === 'UNSOLD' ? 'Invenduto' : `${assignedManager?.name || 'Assegnato'} (${p.purchasePrice} FM)`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Titolarità pill */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1 ${
                          p.titolarita >= 80
                            ? 'bg-emerald-500/20 text-[#00f59b] border border-emerald-500/30'
                            : p.titolarita >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {p.titolarita}%
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: BALLOTTAGGI */}
          {formation.ballots.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Ballottaggi Aperti ({formation.ballots.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formation.ballots.map((p) => {
                  const roleStyle = getRoleColor(p.role);
                  return (
                    <div
                      key={`ballot-${p.id}`}
                      onClick={() => handleSelectAndClose(p.id)}
                      className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${roleStyle.badge}`}>
                          {p.role}
                        </span>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors truncate block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-amber-200/80 font-medium">
                            {p.statusLabel}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black font-mono shrink-0">
                        {p.titolarita}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: PANCHINA & ALTRI DISPONIBILI */}
          {formation.reserves.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Panchina & Riserve ({formation.reserves.length})</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {formation.reserves.map((p) => {
                  const roleStyle = getRoleColor(p.role);
                  const isCurrent = String(p.id) === String(selectedPlayerId);

                  return (
                    <div
                      key={`res-${p.id}`}
                      onClick={() => handleSelectAndClose(p.id)}
                      className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 group ${
                        isCurrent
                          ? 'bg-[#251e60] border-[#00f59b]'
                          : 'bg-[#16113b]/60 hover:bg-[#1d174d] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${roleStyle.badge}`}>
                          {p.role}
                        </span>
                        <span className="font-extrabold text-xs text-slate-200 group-hover:text-white truncate">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {p.titolarita}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: INDISPONIBILI / SQUALIFICATI */}
          {formation.unavailable.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Indisponibili & Squalificati ({formation.unavailable.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formation.unavailable.map((p) => {
                  const roleStyle = getRoleColor(p.role);
                  return (
                    <div
                      key={`unav-${p.id}`}
                      onClick={() => handleSelectAndClose(p.id)}
                      className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 hover:border-rose-400 transition cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 mt-0.5 ${roleStyle.badge}`}>
                          {p.role}
                        </span>
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs sm:text-sm text-white group-hover:text-rose-300 transition-colors truncate block">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-rose-300/90 font-medium leading-tight block mt-0.5">
                            {p.statusLabel}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase shrink-0">
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:p-4 bg-[#140f3b] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <a
            href={getTeamProbabiliUrl(formationModalTeam)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00f59b] hover:underline font-bold flex items-center gap-1.5"
          >
            <span>Apri pagina ufficiale Fantacalcio.it</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setFormationModalTeam(null)}
            className="py-2 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
