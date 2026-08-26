import React, { useEffect, useCallback } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { Player, Role, Manager } from '../types';
import { getPlayerProbabiliStatus, ProbabiliPlayerInfo } from '../utils/probabiliScraper';
import { 
  calculateTargetPrice, 
  getRoleColor, 
  getTitolaritaColor, 
  getMaxBid, 
  getRemainingSlotsForRole,
  getCreditsFromPMA,
  formatRangeInCredits
} from '../utils/calculations';
import { 
  User, 
  Users, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  Crosshair, 
  Flame, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  Award, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  Percent,
  Activity,
  ShieldAlert,
  Calendar,
  Zap,
  HelpCircle
} from 'lucide-react';

export const PlayerFocusCard: React.FC = () => {
  const { 
    players, 
    selectedPlayerId, 
    currentBid, 
    setBid, 
    incrementBid, 
    assignCurrentPlayer, 
    markCurrentUnsold, 
    undoLastAction, 
    history,
    managers, 
    settings,
    selectNextPlayer,
    probabiliData,
    reintroducePlayer
  } = useAuctionStore();

  const player = players.find((p) => String(p.id) === String(selectedPlayerId)) || players[0];
  const user = managers.find((m) => m.isUser) || managers[0];
  const opponents = managers.filter((m) => !m.isUser);

  const probabiliInfo: ProbabiliPlayerInfo | null = player 
    ? getPlayerProbabiliStatus(player, probabiliData?.players || null) 
    : null;

  const pmaCredits = player ? getCreditsFromPMA(player.pma, settings.totalBudget) : 1;
  const pfcCredits = player ? getCreditsFromPMA(player.pfc, settings.totalBudget) : 1;
  const pmaRangeStr = player ? formatRangeInCredits(player.pmaRange, settings.totalBudget) : '1-1 FM';
  const pfcRangeStr = player ? formatRangeInCredits(player.pfcRange, settings.totalBudget) : '1-1 FM';

  const roleStyle = player ? getRoleColor(player.role) : getRoleColor('C');
  const targetInfo = player && user ? calculateTargetPrice(player, user, settings) : null;
  const userRemainingSlots = user && player ? getRemainingSlotsForRole(user, player.role, settings.rosterRequirements) : 0;
  const userCanBuy = user && player ? (user.budget >= currentBid && userRemainingSlots > 0) : false;

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      // Enter -> Assign to User (Me)
      if (e.key === 'Enter') {
        e.preventDefault();
        if (userCanBuy && user) {
          assignCurrentPlayer(user.id);
        }
      }
      // Esc -> Unsold
      else if (e.key === 'Escape') {
        e.preventDefault();
        markCurrentUnsold();
      }
      // Numbers 1-9 -> Assign to Opponent 1-9
      else if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key);
        const targetOpponent = opponents[num - 1];
        if (targetOpponent) {
          e.preventDefault();
          assignCurrentPlayer(targetOpponent.id);
        }
      }
      // Ctrl+Z or Cmd+Z -> Undo
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastAction();
      }
      // Arrow Up or K -> Prev Player
      else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        selectNextPlayer('prev');
      }
      // Arrow Down or J -> Next Player
      else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        selectNextPlayer('next');
      }
      // Plus / Equal -> +1 Bid
      else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        incrementBid(1);
      }
      // Minus -> -1 Bid
      else if (e.key === '-') {
        e.preventDefault();
        incrementBid(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userCanBuy, user, opponents, assignCurrentPlayer, markCurrentUnsold, undoLastAction, selectNextPlayer, incrementBid]);

  if (!player) {
    return (
      <div className="flex items-center justify-center h-full bg-[#120e33]/90 rounded-3xl border border-white/10 p-8 text-slate-400">
        Nessun calciatore selezionato
      </div>
    );
  }

  const isAssigned = Boolean(player.assignedTo);
  const isUnsold = player.assignedTo === 'UNSOLD';
  const assignedManager = isAssigned && !isUnsold ? managers.find((m) => m.id === player.assignedTo) : null;

  return (
    <div className="flex flex-col h-full bg-[#120e33]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/30">
      
      {/* Top Banner & Player Navigation Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#17133f] via-[#1d174d] to-[#17133f] flex items-center justify-between gap-3">
        
        {/* Prev / Next navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => selectNextPlayer('prev')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
            title="Calciatore Precedente (Freccia Su o K)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prec</span>
          </button>
          <button
            onClick={() => selectNextPlayer('next')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-bold"
            title="Calciatore Successivo (Freccia Giù o J)"
          >
            <span className="hidden sm:inline">Succ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Status indicator badge (Free / Assigned / Unsold) */}
        <div>
          {isAssigned ? (
            isUnsold ? (
              <span className="px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                Invenduto
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00f59b] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Acquistato da {assignedManager?.name} per {player.purchasePrice} FM
              </span>
            )
          ) : (
            <span className="px-3.5 py-1 rounded-full bg-[#00f59b]/20 border border-[#00f59b]/40 text-[#00f59b] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              In Battuta Live
            </span>
          )}
        </div>

        {/* Undo Action (Ctrl+Z) */}
        {history.length > 0 && (
          <button
            onClick={undoLastAction}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Annulla ultima operazione (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
            <kbd className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-amber-200">Ctrl+Z</kbd>
          </button>
        )}

      </div>

      {/* Main Focus Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        
        {/* BIG PLAYER SPOTLIGHT HEADER */}
        <div className="bg-[#181342] p-4 sm:p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div 
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: roleStyle.accent }}
          />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            
            {/* Name, Team, Role, Slot */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md ${roleStyle.badge}`}>
                  Ruolo {player.role}
                </span>
                
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {player.slot}° Slot
                </span>

                {player.fasciaFc && (
                  <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 text-xs sm:text-sm font-bold">
                    {player.fasciaFc}
                  </span>
                )}

                {player.roleMantra && (
                  <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                    Mantra: {player.roleMantra}
                  </span>
                )}
              </div>

              {/* Giant Name */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-md">
                {player.name}
              </h1>

              {/* Team Name */}
              <div className="flex items-center gap-3 text-sm sm:text-base text-slate-300 font-semibold">
                <span className="text-slate-100 font-bold">{player.team}</span>
                {player.teamSlug && (
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                    {player.teamSlug}
                  </span>
                )}
                <span>•</span>
                <span className={`px-2.5 py-0.5 rounded-lg border font-bold text-xs ${getTitolaritaColor(player.expectedTitolarita)}`}>
                  {player.probableStatus || `Titolarità ${player.expectedTitolarita}%`}
                </span>
              </div>
            </div>

            {/* Special Badges (Rigori, Piazzati) */}
            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              {player.penaltyProbability > 0 && (
                <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400 leading-none">Rigorista</div>
                    <div className="text-sm font-black font-mono">{player.penaltyProbability}%</div>
                  </div>
                </div>
              )}

              {player.freeKickProbability > 0 && (
                <div className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-2xl flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400 leading-none">Piazzati</div>
                    <div className="text-sm font-black font-mono">{player.freeKickProbability}%</div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Comment / Note Tecniche (If available) */}
          {player.commentoFr && player.commentoFr.trim() !== '' && (
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="text-[#00f59b] font-bold mr-1.5">💡 Consiglio d'Asta:</span>
              {player.commentoFr}
            </div>
          )}

        </div>

        {/* PROBABILI FORMAZIONI DIRETTE DA FANTACALCIO.IT */}
        {probabiliInfo && (
          <div className="p-4 rounded-3xl bg-[#16113f] border border-white/15 shadow-md space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f59b] animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#00f59b]" />
                  Probabili Formazioni ({probabiliData?.matchweek || 'Prossima Giornata'})
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">
                  Fantacalcio.it Live
                </span>
              </div>

              {probabiliInfo.match && (
                <div className="text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{probabiliInfo.match}</span>
                  {probabiliInfo.matchDate && (
                    <span className="text-slate-400 font-normal">({probabiliInfo.matchDate})</span>
                  )}
                </div>
              )}
            </div>

            {/* Status Display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div
                  className={`px-3.5 py-1.5 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2 ${
                    probabiliInfo.status === 'titolare'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-[#00f59b] shadow-sm shadow-emerald-950/40'
                      : probabiliInfo.status === 'ballottaggio'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : probabiliInfo.status === 'panchina'
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : probabiliInfo.status === 'infortunato'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : probabiliInfo.status === 'squalificato'
                      ? 'bg-rose-600/20 border-rose-600/50 text-rose-300'
                      : probabiliInfo.status === 'dubbio'
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                      : 'bg-slate-800/80 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {probabiliInfo.status === 'titolare' && <Zap className="w-4 h-4 fill-current" />}
                  {probabiliInfo.status === 'ballottaggio' && <Activity className="w-4 h-4" />}
                  {probabiliInfo.status === 'panchina' && <Users className="w-4 h-4" />}
                  {probabiliInfo.status === 'infortunato' && <AlertTriangle className="w-4 h-4" />}
                  {probabiliInfo.status === 'squalificato' && <ShieldAlert className="w-4 h-4" />}
                  {probabiliInfo.status === 'non_convocato' && <AlertTriangle className="w-4 h-4 text-rose-400" />}

                  <span>{probabiliInfo.statusLabel}</span>
                </div>

                {probabiliInfo.status === 'non_convocato' && (
                  <p className="text-[11px] text-slate-400 italic">
                    ⚠️ Non appare tra i probabili/convocati per questo turno, ma fa parte della rosa del listone.
                  </p>
                )}
              </div>

              {/* Titolarità Gauge for next match */}
              {probabiliInfo.status !== 'non_convocato' && (
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Probabilità campo:</span>
                  <span className="font-mono font-black text-sm text-[#00f59b]">
                    {probabiliInfo.titolarita}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KEY METRICS GRID (LARGE GLANCEABLE NUMBERS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* PMA (Prezzo Medio Asta) */}
          <div className="bg-[#181342] p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              PMA (Prezzo Medio)
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {pmaCredits}
              </span>
              <span className="text-xs text-slate-400 ml-1 font-sans font-bold">FM</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Range: <span className="text-slate-200 font-semibold">{pmaRangeStr}</span>
            </div>
          </div>

          {/* PFC (Prezzo FantaCulo) */}
          <div className="bg-[#181342] p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              PFC (Valore Algoritmo)
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
                {pfcCredits}
              </span>
              <span className="text-xs text-purple-400 ml-1 font-sans font-bold">FM</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Range: <span className="text-purple-200 font-semibold">{pfcRangeStr}</span>
            </div>
          </div>

          {/* Fantamedia Prevista */}
          <div className="bg-[#181342] p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              FantaMedia Prevista
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {player.expectedFantamedia}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Voto Anno Scorso: <span className="text-slate-200 font-semibold">{player.lastYearVotoBase || 'N/D'}</span>
            </div>
          </div>

          {/* Titolarità % */}
          <div className="bg-[#181342] p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col justify-between">
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Titolarità Prevista
            </div>
            <div className="my-1">
              <span className="text-2xl sm:text-3xl font-black text-[#00f59b] font-mono">
                {player.expectedTitolarita}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-[#00f59b] rounded-full transition-all"
                style={{ width: `${player.expectedTitolarita}%` }}
              />
            </div>
          </div>

        </div>

        {/* DYNAMIC TARGET PRICE RECOMMENDATION */}
        {targetInfo && (
          <div className="bg-gradient-to-r from-[#171c45] via-[#1c2254] to-[#171c45] p-4 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Target Price Consigliato
                </div>
                <div className={`text-xs sm:text-sm font-semibold ${targetInfo.statusColor}`}>
                  {targetInfo.advice}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Consiglio Max</div>
                <div className="text-2xl font-black text-[#00f59b] font-mono leading-none">
                  {targetInfo.targetPrice} <span className="text-xs font-sans font-bold">FM</span>
                </div>
              </div>
              
              <button
                onClick={() => setBid(targetInfo.targetPrice)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition"
                title="Imposta offerta al prezzo target consigliato"
              >
                Imposta
              </button>
            </div>
          </div>
        )}

        {/* BID CONTROLLER & FAST STEPPERS */}
        <div className="bg-[#181342] p-4 sm:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Offerta Corrente in Battuta
            </div>

            {/* Price Presets (PMA / PFC) */}
            <div className="flex items-center gap-2">
              {player.pma > 0 && (
                <button
                  type="button"
                  onClick={() => setBid(pmaCredits)}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition"
                >
                  PMA ({pmaCredits} FM)
                </button>
              )}
              {player.pfc > 0 && (
                <button
                  type="button"
                  onClick={() => setBid(pfcCredits)}
                  className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition"
                >
                  PFC ({pfcCredits} FM)
                </button>
              )}
              <button
                type="button"
                onClick={() => setBid(1)}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition"
              >
                Reset (1)
              </button>
            </div>

          </div>

          {/* GIANT PRICE DISPLAY & DIRECT STEPPERS */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
            
            {/* Minus Button */}
            <button
              type="button"
              onClick={() => incrementBid(-1)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#251e60] hover:bg-[#31287e] active:scale-95 text-white border border-white/10 flex items-center justify-center font-black text-2xl transition shadow-md"
              title="Diminuisci di 1 (Tasto -)"
            >
              <Minus className="w-7 h-7" />
            </button>

            {/* Giant Price Box */}
            <div className="relative flex items-center justify-center">
              <input
                type="number"
                min="1"
                max="9999"
                value={currentBid}
                onChange={(e) => setBid(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-44 sm:w-56 h-20 sm:h-24 bg-[#0d0a26] border-2 border-[#00f59b] focus:ring-4 focus:ring-[#00f59b]/20 rounded-3xl text-center text-4xl sm:text-6xl font-black text-[#00f59b] font-mono outline-none shadow-2xl tracking-tight"
              />
              <span className="absolute right-4 bottom-3 text-xs sm:text-sm font-black text-[#00f59b]/60 font-sans">
                FM
              </span>
            </div>

            {/* Plus Button */}
            <button
              type="button"
              onClick={() => incrementBid(1)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00f59b] hover:bg-[#00e28d] active:scale-95 text-[#0d0a26] flex items-center justify-center font-black text-2xl transition shadow-lg shadow-emerald-500/20"
              title="Aumenta di 1 (Tasto +)"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>

          </div>

          {/* FAST STEPPERS ROW (+1, +2, +5, +10, +20, +50) */}
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 5, 10, 20, 50].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => incrementBid(step)}
                className="py-2.5 rounded-xl bg-[#231b57] hover:bg-[#2e2472] active:scale-95 border border-white/10 text-white font-mono font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-sm"
              >
                +{step}
              </button>
            ))}
          </div>

        </div>

        {/* ONE-TAP ASSIGNMENT ACTIONS (KEY MOMENT OF THE AUCTION) */}
        <div className="space-y-4">
          
          {isUnsold && (
            <button
              type="button"
              onClick={() => reintroducePlayer(player.id)}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg sm:text-xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/40 cursor-pointer animate-pulse"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>RIMETTI QUESTO CALCIATORE IN BATTUTA</span>
            </button>
          )}

          {/* PRIMARY BUTTON: ASSEGNA A ME (INVIO) */}
          <button
            type="button"
            disabled={!userCanBuy}
            onClick={() => user && assignCurrentPlayer(user.id)}
            className={`w-full py-4 sm:py-5 rounded-3xl font-black text-lg sm:text-2xl tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl ${
              userCanBuy
                ? 'bg-gradient-to-r from-[#00f59b] to-[#00d984] hover:from-[#00e28d] hover:to-[#00c576] text-[#090720] shadow-emerald-500/30 active:scale-[0.99] border-2 border-emerald-300/40 animate-pulse-glow'
                : 'bg-slate-800/80 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
            }`}
          >
            <User className="w-6 h-6 stroke-[2.5]" />
            <span>ASSEGNA A ME ({currentBid} FM)</span>
            <kbd className="hidden sm:inline-block text-xs bg-black/30 text-[#090720] px-2 py-0.5 rounded-lg font-mono font-bold">
              Invio ↵
            </kbd>
          </button>

          {!userCanBuy && user && (
            <p className="text-center text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              {userRemainingSlots === 0
                ? `Reparto ${player.role} già al completo (${settings.rosterRequirements[player.role]}/${settings.rosterRequirements[player.role]})`
                : `Budget insufficiente (${user.budget} FM disponibili)`}
            </p>
          )}

          {/* SECONDARY ACTION: ASSEGNA AD AVVERSARI (1-9) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                Assegna ad un Avversario (Tasti 1-{Math.min(9, opponents.length)})
              </span>
              <span>{currentBid} FM</span>
            </div>

            {/* Grid of Opponent Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {opponents.map((opp, idx) => {
                const oppSlotsRemaining = getRemainingSlotsForRole(opp, player.role, settings.rosterRequirements);
                const oppCanBuy = opp.budget >= currentBid && oppSlotsRemaining > 0;
                const oppMaxBid = getMaxBid(opp, settings.rosterRequirements);

                return (
                  <button
                    key={opp.id}
                    type="button"
                    disabled={!oppCanBuy}
                    onClick={() => assignCurrentPlayer(opp.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      oppCanBuy
                        ? 'bg-[#1b1548] hover:bg-[#271e68] border-white/10 hover:border-purple-500/50 text-white cursor-pointer active:scale-95 shadow-sm'
                        : 'bg-[#120e30]/50 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-extrabold text-xs truncate flex-1 pr-1 text-slate-200">
                        {opp.name}
                      </span>
                      {idx < 9 && (
                        <kbd className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                          {idx + 1}
                        </kbd>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-[#00f59b] font-bold">{opp.budget} FM</span>
                      <span className="text-[10px] text-slate-400">Slot {player.role}: {oppSlotsRemaining}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TERTIARY ACTIONS: INVENDUTO / SALTA (ESC) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={markCurrentUnsold}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Segna come Invenduto / Salta</span>
              <kbd className="text-[10px] bg-black/40 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                Esc
              </kbd>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
