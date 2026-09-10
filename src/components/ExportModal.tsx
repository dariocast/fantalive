import React, { useState } from 'react';
import { useAuctionStore } from '../store/useAuctionStore';
import { exportAuctionToExcel, downloadLegheFantacalcioCSV, exportToLegheFantacalcioCSV } from '../utils/excelParser';
import { X, Download, FileSpreadsheet, Check, Share2, Copy, FileText, Info } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { exportModalOpen, setExportModalOpen, managers, players, settings, probabiliData } = useAuctionStore();
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);

  if (!exportModalOpen) return null;

  const handleExportLegheCSV = () => {
    downloadLegheFantacalcioCSV(managers, settings.name, probabiliData?.players);
  };

  const handleCopyLegheCSV = () => {
    const csvContent = exportToLegheFantacalcioCSV(managers, probabiliData?.players);
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopiedCSV(true);
      setTimeout(() => setCopiedCSV(false), 2500);
    });
  };

  const handleExportExcel = () => {
    exportAuctionToExcel(managers, players, settings);
  };

  const handleCopySummaryText = () => {
    let text = `=== RISULTATI ASTA: ${settings.name} ===\n`;
    text += `Budget Iniziale: ${settings.totalBudget} FM | Partecipanti: ${settings.participantsCount}\n\n`;

    managers.forEach((m) => {
      text += `🏆 ${m.name.toUpperCase()} (Residuo: ${m.budget} FM, Spesi: ${m.spent} FM)\n`;
      (['P', 'D', 'C', 'A'] as const).forEach((r) => {
        const list = m.roster[r];
        text += `  [${r}] ${list.map((p) => `${p.name} (${p.purchasePrice} FM)`).join(', ') || 'Nessuno'}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#140f3b] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#00f59b] flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Esporta Risultati Asta</h2>
              <p className="text-xs text-slate-400">Salva e condividi le rose e i bilanci</p>
            </div>
          </div>

          <button
            onClick={() => setExportModalOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          
          {/* Leghe Fantacalcio CSV Export */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1e1752] to-[#251b66] border border-cyan-500/40 hover:border-cyan-400 transition space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">Import Leghe Fantacalcio (.csv)</span>
                    <span className="text-[10px] uppercase font-black bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">Diretto</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formato compatibile con <span className="text-slate-200 font-semibold">leghe.fantacalcio.it</span> (Gestione Rose &rarr; Importa)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportLegheCSV}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Scarica File .CSV
              </button>

              <button
                onClick={handleCopyLegheCSV}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Copia contenuto CSV"
              >
                {copiedCSV ? <Check className="w-3.5 h-3.5 text-[#00f59b]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCSV ? 'Copiato!' : 'Copia CSV'}
              </button>
            </div>
          </div>

          {/* Download Excel (.xlsx) */}
          <button
            onClick={handleExportExcel}
            className="w-full p-4 rounded-2xl bg-[#1e1752] hover:bg-[#2a2072] border border-emerald-500/30 hover:border-emerald-400 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <FileSpreadsheet className="w-6 h-6 text-[#00f59b]" />
              <div>
                <div className="font-extrabold text-sm text-white">Scarica Cartella Excel (.xlsx)</div>
                <div className="text-xs text-slate-400">Include riepilogo, rose complete e svincolati</div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#00f59b] text-black font-bold text-xs">
              Scarica
            </span>
          </button>

          {/* Copy Text Summary for WhatsApp / Telegram */}
          <button
            onClick={handleCopySummaryText}
            className="w-full p-4 rounded-2xl bg-[#1e1752] hover:bg-[#2a2072] border border-white/10 hover:border-white/20 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3 text-left">
              <Share2 className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-extrabold text-sm text-white">Copia Testo per WhatsApp / Chat</div>
                <div className="text-xs text-slate-400">Riepilogo formattato pronto da incollare</div>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center gap-1">
              {copiedText ? <Check className="w-3.5 h-3.5 text-[#00f59b]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedText ? 'Copiato!' : 'Copia'}
            </span>
          </button>

        </div>

        {/* Tip Box */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-slate-400 text-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Come importare su Leghe Fantacalcio:</strong> Accedi alla tua lega &rarr; <em>Gestione Rose</em> &rarr; <em>Importa Rose</em> &rarr; Seleziona il file .CSV esportato.
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setExportModalOpen(false)}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-sm transition cursor-pointer"
        >
          Chiudi
        </button>

      </div>
    </div>
  );
};

