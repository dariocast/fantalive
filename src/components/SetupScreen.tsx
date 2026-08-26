import React, { useState, useEffect } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { AuctionSettings, AuctionMode, BasePriceType, AuctionType, Role, Player, SortRule, SortField, SortDirection } from '../types';
import { parseExcelFile } from '../utils/excelParser';
import defaultPlayersRaw from '../data/defaultPlayers.json';
import { 
  Trophy, 
  Upload, 
  Users, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck, 
  Zap, 
  Settings2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Play,
  Smartphone
} from 'lucide-react';

export const SetupScreen: React.FC = () => {
  const { settings, initAuction, isConfigured, loadCustomPlayers } = useAuctionStore();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
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
        alert('Per installare come app su iPhone/iPad:\n1. Tocca il tasto Condividi 📤 in Safari\n2. Scorri e tocca "Aggiungi alla schermata Home" ➕');
      } else {
        alert('Per installare l\'app:\nApri il menu del browser (⋮ in alto a destra) e seleziona "Installa app" o "Aggiungi a schermata Home".');
      }
    }
  };

  const [name, setName] = useState(settings.name || 'Asta #1');
  const [mode, setMode] = useState<AuctionMode>(settings.mode || 'classic');
  const [trackingMode, setTrackingMode] = useState<'solo_me' | 'full_league'>(settings.trackingMode || 'solo_me');
  const [basePriceType, setBasePriceType] = useState<BasePriceType>(settings.basePriceType || '1credito');
  
  // Total budget state
  const [budgetPreset, setBudgetPreset] = useState<number | 'custom'>(
    [250, 500, 1000].includes(settings.totalBudget) ? settings.totalBudget : 'custom'
  );
  const [customBudget, setCustomBudget] = useState<number>(settings.totalBudget || 500);

  // Switches
  const [modDifesa, setModDifesa] = useState(settings.modDifesa || false);
  const [imbattibilitaPortiere, setImbattibilitaPortiere] = useState(settings.imbattibilitaPortiere !== undefined ? settings.imbattibilitaPortiere : true);

  // Tipologia asta & Cascading sort rules
  const [tipologiaAsta, setTipologiaAsta] = useState<AuctionType>(settings.tipologiaAsta || 'alfabetico');
  const [sortPreset, setSortPreset] = useState<'alfabetico_ruolo' | 'alfabetico_globale' | 'top_ruolo' | 'squadra' | 'random' | 'custom'>('alfabetico_ruolo');
  const [sortRules, setSortRules] = useState<SortRule[]>(
    settings.sortRules || [
      { field: 'role', direction: 'asc' },
      { field: 'name', direction: 'asc' }
    ]
  );

  const handlePresetChange = (preset: 'alfabetico_ruolo' | 'alfabetico_globale' | 'top_ruolo' | 'squadra' | 'random' | 'custom') => {
    setSortPreset(preset);
    if (preset === 'alfabetico_ruolo') {
      setTipologiaAsta('alfabetico');
      setSortRules([
        { field: 'role', direction: 'asc' },
        { field: 'name', direction: 'asc' }
      ]);
    } else if (preset === 'alfabetico_globale') {
      setTipologiaAsta('alfabetico');
      setSortRules([
        { field: 'name', direction: 'asc' }
      ]);
    } else if (preset === 'top_ruolo') {
      setTipologiaAsta('chiamata');
      setSortRules([
        { field: 'role', direction: 'asc' },
        { field: 'slot', direction: 'asc' },
        { field: 'pma', direction: 'desc' }
      ]);
    } else if (preset === 'squadra') {
      setTipologiaAsta('alfabetico');
      setSortRules([
        { field: 'team', direction: 'asc' },
        { field: 'role', direction: 'asc' },
        { field: 'name', direction: 'asc' }
      ]);
    } else if (preset === 'random') {
      setTipologiaAsta('random');
      setSortRules([]);
    }
  };

  // Num partecipanti
  const [participantsPreset, setParticipantsPreset] = useState<number | 'custom'>(
    [6, 8, 10, 12].includes(settings.participantsCount) ? settings.participantsCount : 'custom'
  );
  const [customParticipants, setCustomParticipants] = useState<number>(settings.participantsCount || 8);

  // Participant Names
  const actualParticipants = participantsPreset === 'custom' ? customParticipants : participantsPreset;
  const [managerNames, setManagerNames] = useState<string[]>([
    'Io (Tu)',
    ...Array.from({ length: 15 }, (_, i) => `Avversario ${i + 1}`)
  ]);

  // Roster requirements
  const [rosterReq, setRosterReq] = useState<Record<Role, number>>(settings.rosterRequirements || { P: 3, D: 8, C: 8, A: 6 });

  // Custom Listone
  const [customPlayersList, setCustomPlayersList] = useState<Player[] | null>(null);
  const [fileName, setFileName] = useState<string>('Nessun listone caricato (Seleziona il tuo file .xlsx o .csv)');
  const [loadingFile, setLoadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Advanced accordion
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingFile(true);
    setUploadError(null);
    try {
      const parsed = await parseExcelFile(file);
      setCustomPlayersList(parsed);
      setFileName(`${file.name} (${parsed.length} calciatori caricati)`);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Errore nel caricamento del file Excel');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleStart = () => {
    if (!customPlayersList || customPlayersList.length === 0) {
      setUploadError('Carica prima il tuo file listone (.xlsx o .csv) per iniziare l\'asta');
      setShowAdvanced(true);
      return;
    }

    const finalBudget = budgetPreset === 'custom' ? customBudget : budgetPreset;
    const finalCount = participantsPreset === 'custom' ? customParticipants : participantsPreset;

    const newSettings: AuctionSettings = {
      name: name.trim() || 'Asta #1',
      mode,
      trackingMode,
      basePriceType,
      totalBudget: finalBudget > 0 ? finalBudget : 500,
      modDifesa,
      imbattibilitaPortiere,
      tipologiaAsta,
      sortRules,
      participantsCount: trackingMode === 'solo_me' ? 8 : (finalCount > 0 ? finalCount : 8),
      rosterRequirements: rosterReq
    };

    const finalNames = managerNames.slice(0, finalCount);
    initAuction(newSettings, finalNames, customPlayersList);
  };

  const handleResume = () => {
    useAuctionStore.setState({ isConfigured: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0926] via-[#100c30] to-[#070518] text-white flex items-center justify-center p-3 sm:p-6 lg:p-10 selection:bg-[#00f59b] selection:text-black">
      <div className="w-full max-w-2xl bg-[#141138]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-purple-950/40 space-y-7 relative overflow-hidden">
        
        {/* Glowing aura */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & App Title */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f59b] to-[#00b4d8] flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black font-black text-2xl">
              ⚽
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                FantaLive Companion
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Configurazione pre-asta live a latenza zero
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallPwa}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Installa come Web App (PWA) sul tuo dispositivo"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Installa App</span>
            </button>

            {isConfigured && (
              <button
                type="button"
                onClick={handleResume}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Riprendi Asta
              </button>
            )}
          </div>
        </div>

        {/* FORM CONTENT (Matching screenshot) */}
        <div className="space-y-6 text-sm sm:text-base">
          
          {/* Nome dell'asta */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-slate-300 font-semibold w-36 shrink-0 text-base">
              Nome dell'asta:
            </label>
            <div className="relative flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Asta #1"
                className="w-full bg-[#1b1747] border border-[#00f59b]/50 focus:border-[#00f59b] focus:ring-2 focus:ring-[#00f59b]/20 rounded-full px-5 py-2.5 text-white font-medium outline-none transition placeholder:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          {/* Modalità d'Uso: Solo per Me vs Tutta la Lega */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 Modalità d'Uso</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrackingMode('solo_me')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  trackingMode === 'solo_me'
                    ? 'bg-[#00f59b]/15 border-[#00f59b] shadow-md shadow-emerald-950/40 text-white'
                    : 'bg-[#1a1548]/60 border-white/10 text-slate-400 hover:bg-[#1a1548]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    📱 Solo per Me (Fast)
                  </span>
                  {trackingMode === 'solo_me' && (
                    <span className="text-[10px] bg-[#00f59b] text-black px-1.5 py-0.2 rounded-full font-black">
                      CONSIGLIATO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traccia la tua rosa e target price. Durante l'asta basta 1 tap: <strong>Assegna a Me</strong>, <strong>Avversario</strong> o <strong>Salta</strong>.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrackingMode('full_league')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  trackingMode === 'full_league'
                    ? 'bg-[#00f59b]/15 border-[#00f59b] shadow-md shadow-emerald-950/40 text-white'
                    : 'bg-[#1a1548]/60 border-white/10 text-slate-400 hover:bg-[#1a1548]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    👥 Tutta la Lega
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traccia dettagliatamente i crediti spesi e le rose complete di ogni singolo avversario.
                </p>
              </button>
            </div>
          </div>

          {/* Classic / Mantra Tab Selection */}
          <div className="p-1 bg-[#1a1644] rounded-full flex border border-white/5">
            <button
              type="button"
              onClick={() => setMode('classic')}
              className={`flex-1 py-2.5 rounded-full font-bold text-center transition-all ${
                mode === 'classic'
                  ? 'bg-[#00f59b] text-[#0d0928] shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Classic
            </button>
            <button
              type="button"
              onClick={() => setMode('mantra')}
              className={`flex-1 py-2.5 rounded-full font-bold text-center transition-all ${
                mode === 'mantra'
                  ? 'bg-[#00f59b] text-[#0d0928] shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mantra
            </button>
          </div>

          {/* Modalità */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-slate-300 font-semibold w-36 shrink-0 text-base">
              Modalità:
            </label>
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                type="button"
                onClick={() => setBasePriceType('1credito')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border ${
                  basePriceType === '1credito'
                    ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 font-bold'
                    : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                }`}
              >
                Base 1 credito
              </button>
              <button
                type="button"
                onClick={() => setBasePriceType('draft')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border ${
                  basePriceType === 'draft'
                    ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 font-bold'
                    : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                }`}
              >
                Draft (fantavalore di mercato)
              </button>
              <button
                type="button"
                onClick={() => setBasePriceType('quotazione')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border ${
                  basePriceType === 'quotazione'
                    ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 font-bold'
                    : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                }`}
              >
                Base quotazione
              </button>
            </div>
          </div>

          {/* Crediti totali */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-slate-300 font-semibold w-36 shrink-0 text-base">
              Crediti totali:
            </label>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {[250, 500, 1000].map((credits) => (
                <button
                  key={credits}
                  type="button"
                  onClick={() => setBudgetPreset(credits)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all border ${
                    budgetPreset === credits
                      ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 shadow-sm'
                      : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                  }`}
                >
                  {credits}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setBudgetPreset('custom')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all border ${
                  budgetPreset === 'custom'
                    ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 font-bold'
                    : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                }`}
              >
                Scrivi
              </button>

              {budgetPreset === 'custom' && (
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(parseInt(e.target.value) || 500)}
                  className="w-24 bg-[#1b1747] border border-[#00f59b] rounded-full px-3 py-1.5 text-center text-white font-bold text-sm outline-none"
                  placeholder="FM"
                />
              )}
            </div>
          </div>

          {/* Modificatore di difesa & Imbattibilità portiere */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Modificatore difesa */}
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <label className="text-slate-300 font-semibold text-base">
                Modificatore di difesa:
              </label>
              <button
                type="button"
                onClick={() => setModDifesa(!modDifesa)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out border ${
                  modDifesa ? 'bg-[#00f59b] border-emerald-400' : 'bg-[#252055] border-white/20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-md ${
                    modDifesa ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Imbattibilità portiere */}
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <label className="text-slate-300 font-semibold text-base">
                Imbattibilità portiere:
              </label>
              <button
                type="button"
                onClick={() => setImbattibilitaPortiere(!imbattibilitaPortiere)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out border ${
                  imbattibilitaPortiere ? 'bg-[#00f59b] border-emerald-400' : 'bg-[#252055] border-white/20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ease-in-out shadow-md ${
                    imbattibilitaPortiere ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Ordine di Chiamata & Regole in Cascata */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>🔀 Ordine di Chiamata in Battuta</span>
              </label>
              <span className="text-[11px] text-[#00f59b] font-semibold">Regole in cascata</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetChange('alfabetico_ruolo')}
                className={`p-2.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                  sortPreset === 'alfabetico_ruolo'
                    ? 'border-[#00f59b] bg-[#00f59b]/15 text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'border-white/10 bg-[#1b1747]/60 text-slate-300 hover:bg-[#1b1747]'
                }`}
              >
                <span className="font-extrabold text-sm mb-0.5 text-white">🅰️ Alfabetico / Ruolo</span>
                <span className="text-[10px] text-slate-400">P ➔ D ➔ C ➔ A, Nome A-Z</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('top_ruolo')}
                className={`p-2.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                  sortPreset === 'top_ruolo'
                    ? 'border-[#00f59b] bg-[#00f59b]/15 text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'border-white/10 bg-[#1b1747]/60 text-slate-300 hover:bg-[#1b1747]'
                }`}
              >
                <span className="font-extrabold text-sm mb-0.5 text-white">🏆 Top per Ruolo</span>
                <span className="text-[10px] text-slate-400">Ruolo ➔ Slot 1-8 ➔ PMA</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('alfabetico_globale')}
                className={`p-2.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                  sortPreset === 'alfabetico_globale'
                    ? 'border-[#00f59b] bg-[#00f59b]/15 text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'border-white/10 bg-[#1b1747]/60 text-slate-300 hover:bg-[#1b1747]'
                }`}
              >
                <span className="font-extrabold text-sm mb-0.5 text-white">🔤 Alfabetico Globale</span>
                <span className="text-[10px] text-slate-400">Tutti i ruoli insieme A-Z</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('squadra')}
                className={`p-2.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                  sortPreset === 'squadra'
                    ? 'border-[#00f59b] bg-[#00f59b]/15 text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'border-white/10 bg-[#1b1747]/60 text-slate-300 hover:bg-[#1b1747]'
                }`}
              >
                <span className="font-extrabold text-sm mb-0.5 text-white">🏟️ Per Squadra</span>
                <span className="text-[10px] text-slate-400">Squadra A-Z ➔ Ruolo ➔ Nome</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('random')}
                className={`p-2.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                  sortPreset === 'random'
                    ? 'border-[#00f59b] bg-[#00f59b]/15 text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'border-white/10 bg-[#1b1747]/60 text-slate-300 hover:bg-[#1b1747]'
                }`}
              >
                <span className="font-extrabold text-sm mb-0.5 text-white">🎲 Casuale (Random)</span>
                <span className="text-[10px] text-slate-400">Sorteggio casuale puro</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('custom')}
                className={`p-2.5 rounded-2xl border text-left transition text-xs flex flex-col justify-between cursor-pointer ${
                  sortPreset === 'custom'
                    ? 'border-[#00f59b] bg-[#00f59b]/15 text-white font-bold shadow-md shadow-emerald-950/40'
                    : 'border-white/10 bg-[#1b1747]/60 text-slate-300 hover:bg-[#1b1747]'
                }`}
              >
                <span className="font-extrabold text-sm mb-0.5 text-white">⚙️ Personalizzato</span>
                <span className="text-[10px] text-slate-400">Regole manuali 1°, 2°, 3°</span>
              </button>
            </div>

            {/* Custom Cascading Rules Editor */}
            {sortPreset === 'custom' && (
              <div className="p-3.5 rounded-2xl bg-[#0e0b29] border border-white/10 space-y-2.5 text-xs animate-fadeIn">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Definisci i criteri in ordine di priorità:
                </div>

                {/* Rule 1 */}
                <div className="flex items-center gap-2">
                  <span className="w-20 font-bold text-[#00f59b]">1° Criterio:</span>
                  <select
                    value={sortRules[0]?.field || 'role'}
                    onChange={(e) => {
                      const updated = [...sortRules];
                      updated[0] = { field: e.target.value as SortField, direction: 'asc' };
                      setSortRules(updated);
                    }}
                    className="flex-1 bg-[#1c174d] border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium outline-none focus:border-[#00f59b]"
                  >
                    <option value="role">Ruolo (P ➔ D ➔ C ➔ A)</option>
                    <option value="team">Squadra (A-Z)</option>
                    <option value="slot">Slot (1° ➔ 8°)</option>
                    <option value="name">Nome (A ➔ Z)</option>
                    <option value="pma">Prezzo Medio PMA (Alto ➔ Basso)</option>
                  </select>
                </div>

                {/* Rule 2 */}
                <div className="flex items-center gap-2">
                  <span className="w-20 font-bold text-cyan-300">2° Criterio:</span>
                  <select
                    value={sortRules[1]?.field || 'name'}
                    onChange={(e) => {
                      const updated = [...sortRules];
                      const f = e.target.value as SortField;
                      const dir = (f === 'pma' || f === 'pfc' || f === 'fantamedia' || f === 'titolarita') ? 'desc' : 'asc';
                      updated[1] = { field: f, direction: dir };
                      setSortRules(updated);
                    }}
                    className="flex-1 bg-[#1c174d] border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium outline-none focus:border-[#00f59b]"
                  >
                    <option value="name">Nome (A ➔ Z)</option>
                    <option value="pma">PMA Prezzo Medio (Alto ➔ Basso)</option>
                    <option value="pfc">PFC Valore Algoritmo (Alto ➔ Basso)</option>
                    <option value="slot">Slot (1° ➔ 8°)</option>
                    <option value="team">Squadra (A-Z)</option>
                    <option value="fantamedia">Fantamedia Attesa (Alta ➔ Bassa)</option>
                    <option value="titolarita">Titolarità (Alta ➔ Bassa)</option>
                    <option value="none">Nessun 2° criterio</option>
                  </select>
                </div>

                {/* Rule 3 */}
                <div className="flex items-center gap-2">
                  <span className="w-20 font-bold text-amber-300">3° Criterio:</span>
                  <select
                    value={sortRules[2]?.field || 'none'}
                    onChange={(e) => {
                      const updated = [...sortRules];
                      const f = e.target.value as SortField;
                      const dir = (f === 'pma' || f === 'pfc') ? 'desc' : 'asc';
                      updated[2] = { field: f, direction: dir };
                      setSortRules(updated);
                    }}
                    className="flex-1 bg-[#1c174d] border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium outline-none focus:border-[#00f59b]"
                  >
                    <option value="none">Nessun 3° criterio</option>
                    <option value="name">Nome (A ➔ Z)</option>
                    <option value="pma">PMA Prezzo Medio (Alto ➔ Basso)</option>
                    <option value="pfc">PFC Valore Algoritmo (Alto ➔ Basso)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Num partecipanti (Only shown when tracking full league) */}
          {trackingMode === 'full_league' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-slate-300 font-semibold w-36 shrink-0 text-base">
                Num partecipanti:
              </label>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {[6, 8, 10, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setParticipantsPreset(num)}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all border flex items-center justify-center cursor-pointer ${
                      participantsPreset === num
                        ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 shadow-sm'
                        : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setParticipantsPreset('custom')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all border cursor-pointer ${
                    participantsPreset === 'custom'
                      ? 'border-[#00f59b] text-[#00f59b] bg-[#00f59b]/10 font-bold'
                      : 'border-purple-500/30 bg-[#211c52]/60 text-purple-200/80 hover:bg-[#211c52]'
                  }`}
                >
                  Scrivi
                </button>

                {participantsPreset === 'custom' && (
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={customParticipants}
                    onChange={(e) => setCustomParticipants(parseInt(e.target.value) || 8)}
                    className="w-20 bg-[#1b1747] border border-[#00f59b] rounded-full px-3 py-1.5 text-center text-white font-bold text-sm outline-none"
                    placeholder="Num"
                  />
                )}
              </div>
            </div>
          )}

          {/* ADVANCED SETTINGS ACCORDION (Slot Rosa Limits, Listone Excel, and Opponents if Full League) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-2xl bg-[#1b164a]/80 hover:bg-[#1b164a] border border-white/10 text-slate-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#00f59b]" />
                {trackingMode === 'solo_me' ? 'Personalizza Slot Rosa & Listone Excel' : 'Personalizza Nomi Partecipanti, Slot Rosa & Listone Excel'}
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 rounded-2xl bg-[#100d30] border border-white/10 space-y-5 animate-fadeIn">
                
                {/* Listone File Info / Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Listone Calciatori
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 bg-[#1a1548] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 truncate">
                      {fileName}
                    </div>
                    <label className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                      {loadingFile ? 'Caricamento...' : 'Carica Listone Excel (.xlsx, .csv)'}
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
                  )}
                </div>

                {/* Slot Rosa Limits */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Composizione Rosa (Slot per reparto)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['P', 'D', 'C', 'A'] as Role[]).map((r) => (
                      <div key={r} className="bg-[#1a1548] p-2.5 rounded-xl border border-white/5 text-center">
                        <div className="text-xs font-bold text-slate-400 mb-1">Ruolo {r}</div>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={rosterReq[r]}
                          onChange={(e) => setRosterReq({ ...rosterReq, [r]: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#251e60] text-center font-bold text-white rounded-lg py-1 text-sm outline-none border border-white/10 focus:border-[#00f59b]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Managers Names (Only shown when tracking full league) */}
                {trackingMode === 'full_league' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Nomi Partecipanti ({actualParticipants})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {Array.from({ length: actualParticipants }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#1a1548] px-3 py-1.5 rounded-xl border border-white/5">
                          <span className={`text-xs font-bold w-6 ${idx === 0 ? 'text-[#00f59b]' : 'text-slate-400'}`}>
                            {idx === 0 ? 'TU' : `#${idx}`}
                          </span>
                          <input
                            type="text"
                            value={managerNames[idx] || (idx === 0 ? 'Io (Tu)' : `Avversario ${idx}`)}
                            onChange={(e) => {
                              const updated = [...managerNames];
                              updated[idx] = e.target.value;
                              setManagerNames(updated);
                            }}
                            className="flex-1 bg-transparent text-xs font-medium text-white outline-none"
                            placeholder={idx === 0 ? 'Il tuo nome' : `Avversario ${idx}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Big Inizia Button (Exact matching green pill) */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 rounded-full bg-[#00f59b] hover:bg-[#00e28d] active:scale-[0.99] text-[#090720] font-black text-xl tracking-wide shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Inizia
          </button>

        </div>

      </div>
    </div>
  );
};
