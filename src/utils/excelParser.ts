import * as XLSX from 'xlsx';
import { Player, Role, Manager, AuctionSettings } from '../types';

export function deriveRoleFromMantra(roleMantra: string): Role {
  if (!roleMantra) return 'C';
  const rm = roleMantra.toUpperCase().trim();
  if (rm.includes('POR') || rm === 'P') return 'P';

  const tokens = rm.split(/[\s,;/]+/).map((t) => t.trim()).filter(Boolean);

  // Strikers / Forwards
  if (tokens.includes('PC') || tokens.includes('A')) return 'A';
  // Defenders (Central, Right, Left, Braccetto)
  if (tokens.some((t) => ['DC', 'DD', 'DS', 'B'].includes(t))) return 'D';
  // Midfielders / Wingers (Mediano, Centrocampista, Trequartista, Esterno, Ala)
  if (tokens.some((t) => ['M', 'C', 'T', 'E', 'W'].includes(t))) return 'C';

  return 'C';
}

export function parsePlayerFromRow(row: Record<string, unknown>, index: number): Player | null {
  const getVal = (keys: string[]): unknown => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
      const match = Object.keys(row).find(
        (rk) => rk.toLowerCase().trim() === k.toLowerCase().trim()
      );
      if (match && row[match] !== undefined && row[match] !== null && row[match] !== '') {
        return row[match];
      }
    }
    return undefined;
  };

  const name = String(getVal(['name', 'nome', 'calciatore', 'player', 'Nome']) || '').trim();
  if (!name) return null;

  const roleMantra = String(getVal(['rolemantra', 'roleMantra', 'mantra', 'RuoloMantra', 'rMantra', 'rmantra']) || '').trim();
  let rawRole = String(getVal(['role', 'ruolo', 'r', 'R', 'Ruolo']) || '').trim().toUpperCase();

  let role: Role = 'C';
  if (['P', 'D', 'C', 'A'].includes(rawRole)) {
    role = rawRole as Role;
  } else if (rawRole.startsWith('P') && !rawRole.startsWith('PC')) {
    role = 'P';
  } else if (rawRole.startsWith('D')) {
    role = 'D';
  } else if (rawRole.startsWith('A')) {
    role = 'A';
  } else if (rawRole === 'C') {
    role = 'C';
  } else if (roleMantra) {
    role = deriveRoleFromMantra(roleMantra);
  } else if (rawRole.startsWith('C')) {
    role = 'C';
  }

  const team = String(getVal(['team', 'squadra', 'club', 'sq']) || 'Serie A').trim();
  const teamSlug = String(getVal(['teamslug', 'teamSlug', 'sigla', 'sq']) || team.slice(0, 3).toUpperCase()).trim();
  const idFantacalcio = String(getVal(['idfantacalcio', 'idFantacalcio', 'id', 'ID']) || `${teamSlug}_${name}_${index}`);

  const parseNum = (val: unknown, def = 0): number => {
    if (val === undefined || val === null || val === '') return def;
    const n = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    return isNaN(n) ? def : n;
  };

  const parseIntVal = (val: unknown, def = 0): number => {
    const n = parseNum(val, def);
    return Math.round(n);
  };

  const slot = Math.min(8, Math.max(1, parseIntVal(getVal(['slot', 'Slot', 'fascia']), 8)));
  const pma = Math.max(0, Math.round(parseNum(getVal(['pma', 'PMA', 'prezzo_medio', 'quotazione']), 1) * 100) / 100);
  const pfc = Math.max(0, Math.round(parseNum(getVal(['pfc', 'PFC', 'valore']), 1) * 100) / 100);
  const expectedTitolarita = Math.min(100, Math.max(0, parseIntVal(getVal(['expectedtitolarita', 'expectedTitolarita', 'titolarita', 'titolare']), 50)));
  const expectedFantamedia = Math.round(parseNum(getVal(['expectedfantamedia', 'expectedFantamedia', 'fantamedia', 'fm']), 6.0) * 100) / 100;
  const lastYearVotoBase = parseNum(getVal(['lastyearvotobase', 'lastYearVotoBase', 'mediavoto', 'mv']), 0);
  const lastYearFantamedia = parseNum(getVal(['lastyearfantamedia', 'lastYearFantamedia', 'last_fm']), 0);
  const penaltyProbability = parseIntVal(getVal(['penaltyprobability', 'penaltyProbability', 'rigori', 'rigorista']), 0);
  const freeKickProbability = parseIntVal(getVal(['freekickprobability', 'freeKickProbability', 'punizioni', 'piazzati']), 0);
  const status = String(getVal(['playerstatus', 'playerStatus', 'status']) || 'T').trim();
  const fasciaFc = String(getVal(['fasciafc', 'fasciaFc', 'fascia']) || '').trim();
  const fasciaFr = String(getVal(['fasciafr', 'fasciaFr']) || '').trim();
  const commentoFr = String(getVal(['commentofr', 'commentoFr', 'commento', 'note']) || '').trim();
  const newArrival = Boolean(parseIntVal(getVal(['newarrival', 'newArrival', 'nuovo']), 0));

  let probableStatus = `Titolare (${expectedTitolarita}%)`;
  if (expectedTitolarita < 50) {
    probableStatus = `Riserva (${expectedTitolarita}%)`;
  } else if (expectedTitolarita < 80) {
    probableStatus = `Ballottaggio (${expectedTitolarita}%)`;
  }

  return {
    id: idFantacalcio,
    name,
    team,
    teamSlug,
    role,
    slot,
    pma,
    pfc,
    pmaRange: String(getVal(['pmarange', 'pmaRange']) || '1-1'),
    pfcRange: String(getVal(['pfcrange', 'pfcRange']) || '1-1'),
    expectedTitolarita,
    expectedFantamedia,
    lastYearVotoBase: lastYearVotoBase > 0 ? lastYearVotoBase : null,
    lastYearFantamedia: lastYearFantamedia > 0 ? lastYearFantamedia : null,
    penaltyProbability,
    freeKickProbability,
    status,
    probableStatus,
    fasciaFc,
    fasciaFr,
    commentoFr,
    newArrival,
    roleMantra: roleMantra || null,
    assignedTo: null,
    purchasePrice: null,
    assignedAt: null
  };
}

export async function parseExcelFile(file: File): Promise<Player[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let allRows: Record<string, unknown>[] = [];

        // Check if there is an "ALL" sheet or separate role sheets
        if (workbook.SheetNames.includes('ALL')) {
          const ws = workbook.Sheets['ALL'];
          allRows = XLSX.utils.sheet_to_json(ws);
        } else {
          // Check for P, D, C, A or Mantra role sheets (Por, Dc, Dd, Ds, B, M, C, T, E, W, A, Pc)
          for (const sheetName of workbook.SheetNames) {
            if (sheetName.toLowerCase() === 'info') continue;
            const ws = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
            const sheetUpper = sheetName.toUpperCase().trim();

            rows.forEach((r) => {
              if (!r.role && !r.ruolo && !r.Role && !r.Ruolo) {
                if (['P', 'POR'].includes(sheetUpper)) {
                  r.role = 'P';
                } else if (['D', 'DC', 'DD', 'DS', 'B'].includes(sheetUpper)) {
                  r.role = 'D';
                } else if (['C', 'M', 'T', 'E'].includes(sheetUpper)) {
                  r.role = 'C';
                } else if (['A', 'PC', 'W'].includes(sheetUpper)) {
                  r.role = 'A';
                }
              }
            });
            allRows.push(...rows);
          }
        }

        const players: Player[] = [];
        allRows.forEach((row, idx) => {
          const player = parsePlayerFromRow(row, idx);
          if (player) {
            players.push(player);
          }
        });

        if (players.length === 0) {
          throw new Error('Nessun calciatore valido trovato nel file.');
        }

        resolve(players);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export complete auction results to Excel workbook
 */
export function exportAuctionToExcel(
  managers: Manager[],
  players: Player[],
  settings: AuctionSettings
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Tabellone Riepilogo
  const summaryData = managers.map((m) => {
    const isMantra = settings.mode === 'mantra';
    const movementCount = m.roster.D.length + m.roster.C.length + m.roster.A.length;
    return isMantra
      ? {
          'Nome Fantallenatore': m.name,
          'Tipo': m.isUser ? 'TU' : 'Avversario',
          'Budget Iniziale': settings.totalBudget,
          'Crediti Residui': m.budget,
          'Crediti Spesi': m.spent,
          '% Budget Speso': `${Math.round((m.spent / settings.totalBudget) * 100)}%`,
          'Portieri (P)': m.roster.P.length,
          'Giocatori di Movimento': movementCount,
          'Totale Giocatori': m.roster.P.length + movementCount
        }
      : {
          'Nome Fantallenatore': m.name,
          'Tipo': m.isUser ? 'TU' : 'Avversario',
          'Budget Iniziale': settings.totalBudget,
          'Crediti Residui': m.budget,
          'Crediti Spesi': m.spent,
          '% Budget Speso': `${Math.round((m.spent / settings.totalBudget) * 100)}%`,
          'Portieri (P)': m.roster.P.length,
          'Difensori (D)': m.roster.D.length,
          'Centrocampisti (C)': m.roster.C.length,
          'Attaccanti (A)': m.roster.A.length,
          'Totale Giocatori': m.roster.P.length + m.roster.D.length + m.roster.C.length + m.roster.A.length
        };
  });
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Riepilogo Asta');

  // Sheet 2: Rose Dettagliate
  const detailedRosterRows: Record<string, unknown>[] = [];
  managers.forEach((m) => {
    (['P', 'D', 'C', 'A'] as Role[]).forEach((role) => {
      m.roster[role].forEach((p) => {
        detailedRosterRows.push({
          'Fantallenatore': m.name,
          'Ruolo Classic': p.role,
          'Ruolo Mantra': p.roleMantra || '',
          'Nome Calciatore': p.name,
          'Squadra': p.team,
          'Prezzo Acquisto': p.purchasePrice,
          'Slot': p.slot,
          'PMA': p.pma,
          'PFC': p.pfc,
          'Fantamedia Prevista': p.expectedFantamedia,
          'Titolarità': `${p.expectedTitolarita}%`
        });
      });
    });
  });
  const wsDetails = XLSX.utils.json_to_sheet(detailedRosterRows);
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Tutte le Rose');

  // Sheet 3: Svincolati / Non Assegnati
  const unsoldPlayers = players.filter((p) => !p.assignedTo).map((p) => ({
    'Ruolo': p.role,
    'Nome': p.name,
    'Squadra': p.team,
    'Slot': p.slot,
    'PMA': p.pma,
    'PFC': p.pfc,
    'Fantamedia Prevista': p.expectedFantamedia,
    'Titolarità': `${p.expectedTitolarita}%`
  }));
  const wsUnsold = XLSX.utils.json_to_sheet(unsoldPlayers);
  XLSX.utils.book_append_sheet(wb, wsUnsold, 'Svincolati Rimanenti');

  // Write file
  const fileName = `${settings.name.replace(/\s+/g, '_')}_Risultati_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Resolves the numeric Fantacalcio ID for a player.
 * Checks player.idFantacalcio, player.id, and falls back to probabiliMap lookup.
 */
export function resolvePlayerId(
  player: Player,
  probabiliMap?: Record<string, { id: string; name?: string }> | null
): string {
  // 1. If idFantacalcio is numeric (e.g. 2764)
  if (player.idFantacalcio && /^\d+$/.test(String(player.idFantacalcio).trim())) {
    return String(player.idFantacalcio).trim();
  }
  // 2. If player.id is numeric
  if (player.id && /^\d+$/.test(String(player.id).trim())) {
    return String(player.id).trim();
  }
  // 3. Search probabiliMap (from probabili live / defaultProbabili)
  if (probabiliMap) {
    const norm = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const upper = player.name.toUpperCase().trim();
    const key = norm(player.name);

    if (probabiliMap[key]?.id && /^\d+$/.test(probabiliMap[key].id)) {
      return probabiliMap[key].id;
    }
    if (probabiliMap[upper]?.id && /^\d+$/.test(probabiliMap[upper].id)) {
      return probabiliMap[upper].id;
    }
    const firstWord = upper.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 3 && probabiliMap[firstWord]?.id && /^\d+$/.test(probabiliMap[firstWord].id)) {
      return probabiliMap[firstWord].id;
    }
  }
  // 4. Fallback: string representation
  return String(player.idFantacalcio || player.id || player.name);
}

/**
 * Exports managers' rosters into Leghe Fantacalcio CSV format:
 * $,$,$
 * <TeamName>,<PlayerId>,<Price>
 * $,$,$
 * <TeamName2>,<PlayerId2>,<Price2>
 */
export function exportToLegheFantacalcioCSV(
  managers: Manager[],
  probabiliMap?: Record<string, { id: string; name?: string }> | null
): string {
  const lines: string[] = [];

  managers.forEach((m) => {
    const allPlayers: Player[] = [
      ...m.roster.P,
      ...m.roster.D,
      ...m.roster.C,
      ...m.roster.A
    ];

    if (allPlayers.length === 0) return;

    lines.push('$,$,$');
    allPlayers.forEach((p) => {
      const pid = resolvePlayerId(p, probabiliMap);
      const price =
        p.purchasePrice !== null && p.purchasePrice !== undefined && !isNaN(Number(p.purchasePrice))
          ? Number(p.purchasePrice)
          : 1;
      lines.push(`${m.name},${pid},${price}`);
    });
  });

  return lines.join('\n');
}

/**
 * Generates and triggers the browser download of the Leghe Fantacalcio CSV file.
 */
export function downloadLegheFantacalcioCSV(
  managers: Manager[],
  auctionName: string,
  probabiliMap?: Record<string, { id: string; name?: string }> | null
): void {
  const csvContent = exportToLegheFantacalcioCSV(managers, probabiliMap);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (auctionName || 'Asta').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeName}_LegheFantacalcio_Rose_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

