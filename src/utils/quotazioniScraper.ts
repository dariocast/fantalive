import { Player, Role } from '../types';

export const SERIE_A_TEAMS_MAP: Record<string, string> = {
  ATA: 'Atalanta',
  BOL: 'Bologna',
  CAG: 'Cagliari',
  COM: 'Como',
  EMP: 'Empoli',
  FIO: 'Fiorentina',
  FRO: 'Frosinone',
  GEN: 'Genoa',
  INT: 'Inter',
  JUV: 'Juventus',
  LAZ: 'Lazio',
  LEC: 'Lecce',
  MIL: 'Milan',
  MON: 'Monza',
  NAP: 'Napoli',
  PAR: 'Parma',
  ROM: 'Roma',
  SAS: 'Sassuolo',
  TOR: 'Torino',
  UDI: 'Udinese',
  VEN: 'Venezia',
  VER: 'Verona'
};

const unescapeHtml = (str: string) => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&igrave;/g, 'ì')
    .replace(/&nbsp;/g, ' ');
};

export function parseQuotazioniHtml(htmlStr: string): Player[] {
  const players: Player[] = [];
  const rowRegex = /<tr class="player-row"[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;

  while ((match = rowRegex.exec(htmlStr)) !== null) {
    const rowHtml = match[1];

    // Extract link, name, id: href="https://www.fantacalcio.it/serie-a/squadre/roma/svilar/5841"
    const linkMatch = rowHtml.match(/href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/([^\/]+)\/([^\/]+)\/(\d+)"/i);
    if (!linkMatch) continue;

    const teamPath = linkMatch[1];
    const playerSlug = linkMatch[2];
    const id = linkMatch[3];

    // Name
    const nameMatch = rowHtml.match(/<a [^>]*player-name[^>]*>\s*<span>(.*?)<\/span>/i) ||
                      rowHtml.match(/data-filter-keywords="([^"]+)"/i);
    const rawName = nameMatch ? nameMatch[1].trim() : playerSlug.toUpperCase();
    const name = unescapeHtml(rawName).trim();

    // Roles
    const classicRoleMatch = rowHtml.match(/data-filter-role-classic="([^"]+)"/i) ||
                             rowHtml.match(/<span class="role" data-value="([^"]+)"/i);
    const rawClassic = classicRoleMatch ? classicRoleMatch[1].toUpperCase().trim() : 'C';
    const role: Role = (['P', 'D', 'C', 'A'].includes(rawClassic) ? rawClassic as Role : 'C');

    const mantraRoleMatch = rowHtml.match(/data-filter-role-mantra="([^"]+)"/i) ||
                            rowHtml.match(/<span class="role role-mantra" data-value="([^"]+)"/i);
    const rawMantra = mantraRoleMatch ? mantraRoleMatch[1].trim() : '';
    // Normalize mantra roles: "por" -> "Por", "dd;ds;e" -> "Dd, Ds, E"
    const roleMantra = rawMantra
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
      .join(', ');

    // Team
    const teamMatch = rowHtml.match(/data-col-key="sq"[^>]*>\s*([A-Z]{3})/i);
    const teamSlug = teamMatch ? teamMatch[1].trim() : teamPath.slice(0, 3).toUpperCase();
    const team = SERIE_A_TEAMS_MAP[teamSlug] || (teamPath.charAt(0).toUpperCase() + teamPath.slice(1));

    // FVM Classic & Mantra
    const fvmClassicMatch = rowHtml.match(/data-col-key="c_fvm"[^>]*>\s*(\d+)/i);
    const fvmMantraMatch = rowHtml.match(/data-col-key="m_fvm"[^>]*>\s*(\d+)/i);
    const fvmClassic = fvmClassicMatch ? parseInt(fvmClassicMatch[1], 10) : 1;
    const fvmMantra = fvmMantraMatch ? parseInt(fvmMantraMatch[1], 10) : 1;

    // Initial / Current Quotazione
    const qiMatch = rowHtml.match(/data-col-key="c_qi"[^>]*>\s*(\d+)/i);
    const qaMatch = rowHtml.match(/data-col-key="c_qa"[^>]*>\s*(\d+)/i);
    const qi = qiMatch ? parseInt(qiMatch[1], 10) : 1;
    const qa = qaMatch ? parseInt(qaMatch[1], 10) : 1;

    // Slot estimation based on FVM / Quotazione
    let slot = 8;
    if (fvmClassic >= 50) slot = 1;
    else if (fvmClassic >= 30) slot = 2;
    else if (fvmClassic >= 18) slot = 3;
    else if (fvmClassic >= 10) slot = 4;
    else if (fvmClassic >= 6) slot = 5;
    else if (fvmClassic >= 3) slot = 6;
    else if (fvmClassic >= 2) slot = 7;

    const expectedTitolarita = fvmClassic > 15 ? 88 : (fvmClassic > 5 ? 70 : 45);

    players.push({
      id,
      idFantacalcio: id,
      name,
      team,
      teamSlug,
      role,
      roleMantra: roleMantra || null,
      slot,
      pma: qa,
      pfc: fvmClassic,
      pmaRange: `${Math.max(1, qa - 2)}-${qa + 3}`,
      pfcRange: `${Math.max(1, fvmClassic - 5)}-${fvmClassic + 5}`,
      expectedTitolarita,
      expectedFantamedia: 6.0,
      lastYearVotoBase: null,
      lastYearFantamedia: null,
      penaltyProbability: 0,
      freeKickProbability: 0,
      status: 'T',
      probableStatus: expectedTitolarita >= 80 ? 'Titolare' : (expectedTitolarita >= 60 ? 'Ballottaggio' : 'Riserva'),
      fasciaFc: slot <= 2 ? 'Top' : (slot <= 4 ? 'Semi-Top' : 'TitLowCost'),
      fasciaFr: slot <= 2 ? 'Top' : (slot <= 4 ? 'Semi-Top' : 'TitLowCost'),
      commentoFr: '',
      newArrival: false,
      assignedTo: null,
      purchasePrice: null,
      assignedAt: null
    });
  }

  return players;
}

export async function fetchLiveQuotazioni(): Promise<Player[] | null> {
  const targetUrl = 'https://www.fantacalcio.it/quotazioni-fantacalcio';
  const proxyEndpoints = [
    '/api/quotazioni',
    `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];

  for (const endpoint of proxyEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }
      });

      if (res.ok) {
        const text = await res.text();
        clearTimeout(timeoutId);
        if (text && text.includes('player-row')) {
          const players = parseQuotazioniHtml(text);
          if (players.length > 200) {
            return players;
          }
        }
      }
    } catch {
      // try next proxy endpoint
    }
  }

  return null;
}
