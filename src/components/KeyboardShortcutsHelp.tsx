import React from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { X, Keyboard } from 'lucide-react';

export const KeyboardShortcutsHelp: React.FC = () => {
  const { hotkeyHelpOpen, setHotkeyHelpOpen } = useAuctionStore();

  if (!hotkeyHelpOpen) return null;

  const shortcuts = [
    { key: 'Invio ↵', desc: 'Assegna il calciatore in battuta a TE STESSO al prezzo corrente' },
    { key: '1 - 9', desc: 'Assegna il calciatore al corrispondente AVVERSARIO 1 - 9' },
    { key: 'Esc', desc: 'Segna il calciatore come INVENDUTO e passa al successivo' },
    { key: 'Ctrl + Z / Cmd + Z', desc: 'ANNULLA l\'ultima assegnazione effettuata (Undo)' },
    { key: 'Freccia Su / K', desc: 'Seleziona il calciatore PRECEDENTE nel listone' },
    { key: 'Freccia Giù / J', desc: 'Seleziona il calciatore SUCCESSIVO nel listone' },
    { key: '+ / -', desc: 'Aumenta o diminuisci l\'offerta di 1 credito' },
    { key: '/ oppure Spazio', desc: 'Sposta il focus sulla BARRA DI RICERCA rapida' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#140f3b] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Scorciatoie da Tastiera</h2>
              <p className="text-xs text-slate-400">Comandi rapidi per operare a zero latenza durante l'asta</p>
            </div>
          </div>

          <button
            onClick={() => setHotkeyHelpOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#1e1752] rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-xl bg-[#2e2375] text-[#00f59b] font-mono font-bold shrink-0 border border-emerald-500/30">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setHotkeyHelpOpen(false)}
          className="w-full py-3 rounded-2xl bg-[#00f59b] hover:bg-[#00e28d] text-black font-black text-sm transition"
        >
          Ho Capito
        </button>

      </div>
    </div>
  );
};
