import { Player } from '../types';

export interface ProbabiliPlayerInfo {
  id: string;
  name: string;
  slug?: string;
  team?: string;
  status: 'titolare' | 'panchina' | 'ballottaggio' | 'infortunato' | 'squalificato' | 'dubbio' | 'non_convocato';
  statusLabel: string;
  titolarita: number;
  ballotPartner?: string;
  ballotPct?: number;
  description?: string;
  match?: string;
  matchDate?: string;
}

export interface ProbabiliResponse {
  updatedAt: string;
  matchweek?: string;
  playersCount: number;
  players: Record<string, ProbabiliPlayerInfo>; // keyed by idFantacalcio, slug, and normalized uppercase name
}

export function parseProbabiliHtml(html: string): ProbabiliResponse {
  const matchesRaw = html.split(/<li[^>]*class="[^"]*match-item[^"]*"[^>]*>/);
  const players: Record<string, ProbabiliPlayerInfo> = {};

  const unescapeHtml = (str: string) => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#xE8;/g, 'è')
      .replace(/&#xE0;/g, 'à')
      .replace(/&#xF2;/g, 'ò')
      .replace(/&#xF9;/g, 'ù')
      .replace(/&#xEC;/g, 'ì');
  };

  const stripTags = (str: string) => unescapeHtml(str.replace(/<[^>]+>/g, '').trim());

  // Extract matchweek
  const mwMatch = html.match(/<div[^>]*class="[^"]*matchweek[^"]*"[^>]*>(.*?)<\/div>/);
  const matchweek = mwMatch ? stripTags(mwMatch[1]) : '';

  for (let mIdx = 1; mIdx < matchesRaw.length; mIdx++) {
    const matchHtml = matchesRaw[mIdx];

    // Match Date
    const mDateMatch = matchHtml.match(/<div[^>]*class="[^"]*match-date[^"]*"[^>]*>(.*?)<\/div>/s);
    const matchDate = mDateMatch ? stripTags(mDateMatch[1]).replace(/\s+/g, ' ') : '';

    // Teams
    const teamMatches = Array.from(matchHtml.matchAll(/<a[^>]*class="[^"]*team-name[^"]*"[^>]*>(.*?)<\/a>/gs));
    const teamNames = teamMatches.map((t) => stripTags(t[1]));
    const matchTitle = teamNames.join(' vs ');

    // 1. Starters (Titolari) with EXACT progress aria-valuenow
    const startersBlocks = Array.from(matchHtml.matchAll(/<ul[^>]*class="[^"]*starters[^"]*"[^>]*>(.*?)<\/ul>/gs));
    startersBlocks.forEach((sBlock, idx) => {
      const team = teamNames[idx] || '';
      const pItems = Array.from(sBlock[1].matchAll(/<li[^>]*class="player-item[^"]*"[^>]*>(.*?)<\/li>/gs));
      pItems.forEach((it) => {
        const link = it[1].match(/href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>/s);
        if (!link) return;
        const [, pslug, pid, pname] = link;
        const valMatch = it[1].match(/aria-valuenow="(\d+)"/);
        const val = valMatch ? parseInt(valMatch[1]) : 90;
        const cleanName = stripTags(pname);

        const info: ProbabiliPlayerInfo = {
          id: pid,
          name: cleanName,
          slug: pslug,
          team,
          status: 'titolare',
          statusLabel: `Titolare (${val}%)`,
          titolarita: val,
          match: matchTitle,
          matchDate
        };
        players[pid] = info;
        players[pslug] = info;
        players[cleanName.toUpperCase()] = info;
      });
    });

    // 2. Reserves (Panchina) with EXACT progress aria-valuenow
    const reservesBlocks = Array.from(matchHtml.matchAll(/<ul[^>]*class="[^"]*reserves[^"]*"[^>]*>(.*?)<\/ul>/gs));
    reservesBlocks.forEach((rBlock, idx) => {
      const team = teamNames[idx] || '';
      const pItems = Array.from(rBlock[1].matchAll(/<li[^>]*class="player-item[^"]*"[^>]*>(.*?)<\/li>/gs));
      pItems.forEach((it) => {
        const link = it[1].match(/href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>/s);
        if (!link) return;
        const [, pslug, pid, pname] = link;
        const valMatch = it[1].match(/aria-valuenow="(\d+)"/);
        const val = valMatch ? parseInt(valMatch[1]) : 10;
        const cleanName = stripTags(pname);

        if (!players[pid]) {
          const info: ProbabiliPlayerInfo = {
            id: pid,
            name: cleanName,
            slug: pslug,
            team,
            status: 'panchina',
            statusLabel: `Panchina (${val}%)`,
            titolarita: val,
            match: matchTitle,
            matchDate
          };
          players[pid] = info;
          players[pslug] = info;
          players[cleanName.toUpperCase()] = info;
        }
      });
    });

    // 3. Ballottaggi with EXACT percentage & partner
    const ballotsSection = matchHtml.match(/<section[^>]*class="[^"]*ballots[^"]*"[^>]*>(.*?)<\/section>/s);
    if (ballotsSection) {
      const bItems = Array.from(ballotsSection[1].matchAll(/<div[^>]*class="ballot"[^>]*>(.*?)<\/div>\s*<\/div>/gs));
      const effectiveItems = bItems.length > 0 ? bItems : Array.from(ballotsSection[1].matchAll(/<div[^>]*class="ballot"[^>]*>(.*?)<\/ul>/gs));
      
      effectiveItems.forEach((b) => {
        const links = Array.from(
          b[1].matchAll(/href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>.*?<strong[^>]*class="percentage"[^>]*>\s*(\d+)%\s*<\/strong>/gs)
        );
        if (links.length >= 2) {
          const [, p1_slug, p1_id, p1_name, p1_pctStr] = links[0];
          const [, p2_slug, p2_id, p2_name, p2_pctStr] = links[1];
          const p1_pct = parseInt(p1_pctStr);
          const p2_pct = parseInt(p2_pctStr);
          const cleanP1 = stripTags(p1_name);
          const cleanP2 = stripTags(p2_name);

          const info1: ProbabiliPlayerInfo = {
            id: p1_id,
            name: cleanP1,
            slug: p1_slug,
            team: players[p1_id]?.team || '',
            status: 'ballottaggio',
            statusLabel: `Ballottaggio ${p1_pct}% (con ${cleanP2} ${p2_pct}%)`,
            titolarita: p1_pct,
            ballotPartner: cleanP2,
            ballotPct: p1_pct,
            match: matchTitle,
            matchDate
          };

          const info2: ProbabiliPlayerInfo = {
            id: p2_id,
            name: cleanP2,
            slug: p2_slug,
            team: players[p2_id]?.team || '',
            status: 'ballottaggio',
            statusLabel: `Ballottaggio ${p2_pct}% (con ${cleanP1} ${p1_pct}%)`,
            titolarita: p2_pct,
            ballotPartner: cleanP1,
            ballotPct: p2_pct,
            match: matchTitle,
            matchDate
          };

          players[p1_id] = info1;
          players[p1_slug] = info1;
          players[cleanP1.toUpperCase()] = info1;

          players[p2_id] = info2;
          players[p2_slug] = info2;
          players[cleanP2.toUpperCase()] = info2;
        }
      });
    }

    // 4. Injured (Infortunati / Indisponibili)
    const injuredSection = matchHtml.match(/<section[^>]*class="[^"]*injureds[^"]*"[^>]*>(.*?)<\/section>/s);
    if (injuredSection) {
      const injItems = Array.from(
        injuredSection[1].matchAll(/<li[^>]*>\s*<a[^>]*href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span><\/a>.*?<p[^>]*class="description"[^>]*>(.*?)<\/p>/gs)
      );
      injItems.forEach(([, pslug, pid, pname, pdesc]) => {
        const cleanName = stripTags(pname);
        const cleanDesc = stripTags(pdesc);
        const info: ProbabiliPlayerInfo = {
          id: pid,
          name: cleanName,
          slug: pslug,
          team: players[pid]?.team || '',
          status: 'infortunato',
          statusLabel: `Infortunato: ${cleanDesc}`,
          description: cleanDesc,
          titolarita: 0,
          match: matchTitle,
          matchDate
        };
        players[pid] = info;
        players[pslug] = info;
        players[cleanName.toUpperCase()] = info;
      });
    }

    // 5. Suspended (Squalificati)
    const suspSection = matchHtml.match(/<section[^>]*class="[^"]*suspendeds[^"]*"[^>]*>(.*?)<\/section>/s);
    if (suspSection) {
      const suspLinks = Array.from(
        suspSection[1].matchAll(/href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>/gs)
      );
      suspLinks.forEach(([, pslug, pid, pname]) => {
        const cleanName = stripTags(pname);
        const info: ProbabiliPlayerInfo = {
          id: pid,
          name: cleanName,
          slug: pslug,
          team: players[pid]?.team || '',
          status: 'squalificato',
          statusLabel: 'Squalificato',
          titolarita: 0,
          match: matchTitle,
          matchDate
        };
        players[pid] = info;
        players[pslug] = info;
        players[cleanName.toUpperCase()] = info;
      });
    }

    // 6. Dubts (In dubbio)
    const dubtsSection = matchHtml.match(/<section[^>]*class="[^"]*dubts[^"]*"[^>]*>(.*?)<\/section>/s);
    if (dubtsSection) {
      const dubtItems = Array.from(
        dubtsSection[1].matchAll(/<li[^>]*>\s*<a[^>]*href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span><\/a>.*?<p[^>]*class="description"[^>]*>(.*?)<\/p>/gs)
      );
      dubtItems.forEach(([, pslug, pid, pname, pdesc]) => {
        const cleanName = stripTags(pname);
        const cleanDesc = stripTags(pdesc);
        const info: ProbabiliPlayerInfo = {
          id: pid,
          name: cleanName,
          slug: pslug,
          team: players[pid]?.team || '',
          status: 'dubbio',
          statusLabel: `In dubbio: ${cleanDesc}`,
          description: cleanDesc,
          titolarita: 20,
          match: matchTitle,
          matchDate
        };
        players[pid] = info;
        players[pslug] = info;
        players[cleanName.toUpperCase()] = info;
      });
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    matchweek: matchweek ? `Giornata ${matchweek}` : 'Prossima Giornata',
    playersCount: Object.keys(players).length,
    players
  };
}

/**
 * Enriches a player with real-time probabili formazioni from Fantacalcio.it
 */
export function getPlayerProbabiliStatus(
  player: Player,
  probabiliMap: Record<string, ProbabiliPlayerInfo> | null
): ProbabiliPlayerInfo {
  if (!probabiliMap) {
    return {
      id: String(player.id),
      name: player.name,
      status: player.expectedTitolarita >= 80 ? 'titolare' : player.expectedTitolarita >= 50 ? 'ballottaggio' : 'panchina',
      statusLabel: player.probableStatus || `Titolarità ${player.expectedTitolarita}%`,
      titolarita: player.expectedTitolarita
    };
  }

  // Look up by ID
  const pid = String(player.id);
  if (probabiliMap[pid]) {
    return probabiliMap[pid];
  }

  // Look up by normalized uppercase name
  const upperName = player.name.toUpperCase().trim();
  if (probabiliMap[upperName]) {
    return probabiliMap[upperName];
  }

  // Look up by last name only
  const lastName = upperName.split(' ')[0];
  if (probabiliMap[lastName]) {
    return probabiliMap[lastName];
  }

  // Player belongs to listone team but is NOT present in probabili formazioni (Non convocato / Fuori rosa)
  return {
    id: String(player.id),
    name: player.name,
    team: player.team,
    status: 'non_convocato',
    statusLabel: 'Non convocato / Fuori lista',
    titolarita: 0
  };
}
