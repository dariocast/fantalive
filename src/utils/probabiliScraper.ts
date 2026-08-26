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
  players: Record<string, ProbabiliPlayerInfo>; // keyed by idFantacalcio, slug, uppercase name, normalized name
}

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
    .replace(/&#xEC;/g, 'ì')
    .replace(/&eacute;/g, 'é')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&igrave;/g, 'ì')
    .replace(/&nbsp;/g, ' ');
};

const stripTags = (str: string) => unescapeHtml(str.replace(/<[^>]+>/g, '').trim());
const normalizeKey = (str: string) => str.toUpperCase().replace(/[^A-Z0-9]/g, '');

export function parseProbabiliAndInfortunatiHtml(
  probabiliHtml: string,
  infortunatiHtml?: string
): ProbabiliResponse {
  const players: Record<string, ProbabiliPlayerInfo> = {};

  // 1. First, parse master infortunati list if available
  if (infortunatiHtml) {
    const teamSections = infortunatiHtml.split(/<div[^>]*class="[^"]*card team-card[^"]*"[^>]*>/);
    for (let i = 1; i < teamSections.length; i++) {
      const sec = teamSections[i];
      const tNameMatch = sec.match(/<h[234][^>]*class="[^"]*team-name[^"]*"[^>]*>(.*?)<\/h[234]>/s);
      const teamName = tNameMatch ? stripTags(tNameMatch[1]) : '';

      const items = Array.from(
        sec.matchAll(/<li>\s*<strong[^>]*class="item-name"[^>]*>(.*?)<\/strong>\s*<div[^>]*class="item-description"[^>]*>(.*?)<\/div>\s*<\/li>/gs)
      );

      items.forEach(([, rawName, rawDesc]) => {
        const pname = stripTags(rawName);
        const desc = stripTags(rawDesc);
        const info: ProbabiliPlayerInfo = {
          id: pname,
          name: pname,
          team: teamName,
          status: 'infortunato',
          statusLabel: `Infortunato: ${desc}`,
          description: desc,
          titolarita: 0
        };

        const upper = pname.toUpperCase().trim();
        players[upper] = info;
        players[normalizeKey(pname)] = info;

        // Also index by first word if multiple (e.g. "SULEMANA K." -> "SULEMANA")
        const parts = upper.split(' ');
        if (parts.length > 1 && parts[0].length >= 3) {
          players[parts[0]] = info;
        }
      });
    }
  }

  // 2. Parse probabili formazioni page
  if (probabiliHtml) {
    const matchesRaw = probabiliHtml.split(/<li[^>]*class="[^"]*match-item[^"]*"[^>]*>/);

    // Extract matchweek
    const mwMatch = probabiliHtml.match(/<div[^>]*class="[^"]*matchweek[^"]*"[^>]*>(.*?)<\/div>/);
    const matchweek = mwMatch ? stripTags(mwMatch[1]) : '2';

    for (let mIdx = 1; mIdx < matchesRaw.length; mIdx++) {
      const matchHtml = matchesRaw[mIdx];

      // Match Date
      const mDateMatch = matchHtml.match(/<div[^>]*class="[^"]*match-date[^"]*"[^>]*>(.*?)<\/div>/s);
      const matchDate = mDateMatch ? stripTags(mDateMatch[1]).replace(/\s+/g, ' ') : '';

      // Teams
      const teamMatches = Array.from(matchHtml.matchAll(/<a[^>]*class="[^"]*team-name[^"]*"[^>]*>(.*?)<\/a>/gs));
      const teamNames = teamMatches.map((t) => stripTags(t[1]));
      const matchTitle = teamNames.join(' vs ');

      // 1. Starters
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
          players[cleanName.toUpperCase().trim()] = info;
          players[normalizeKey(cleanName)] = info;
        });
      });

      // 2. Reserves
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

          if (!players[pid] || players[pid].status === 'panchina') {
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
            players[cleanName.toUpperCase().trim()] = info;
            players[normalizeKey(cleanName)] = info;
          }
        });
      });

      // 3. Ballots (Iterate all ballots in match)
      const ballotSections = Array.from(matchHtml.matchAll(/<section[^>]*class="[^"]*ballots[^"]*"[^>]*>(.*?)<\/section>/gs));
      ballotSections.forEach((bSec) => {
        const bItems = Array.from(bSec[1].matchAll(/<div[^>]*class="ballot"[^>]*>(.*?)<\/ul>/gs));
        bItems.forEach((b) => {
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
            players[cleanP1.toUpperCase().trim()] = info1;
            players[normalizeKey(cleanP1)] = info1;

            players[p2_id] = info2;
            players[p2_slug] = info2;
            players[cleanP2.toUpperCase().trim()] = info2;
            players[normalizeKey(cleanP2)] = info2;
          }
        });
      });

      // 4. Injureds in match
      const injuredSections = Array.from(matchHtml.matchAll(/<section[^>]*class="[^"]*injureds[^"]*"[^>]*>(.*?)<\/section>/gs));
      injuredSections.forEach((injSec) => {
        const injItems = Array.from(
          injSec[1].matchAll(/<li[^>]*>\s*<a[^>]*href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span><\/a>.*?<p[^>]*class="description"[^>]*>(.*?)<\/p>/gs)
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
          players[cleanName.toUpperCase().trim()] = info;
          players[normalizeKey(cleanName)] = info;
        });
      });

      // 5. Suspendeds in match
      const suspSections = Array.from(matchHtml.matchAll(/<section[^>]*class="[^"]*suspendeds[^"]*"[^>]*>(.*?)<\/section>/gs));
      suspSections.forEach((suspSec) => {
        const suspLinks = Array.from(
          suspSec[1].matchAll(/href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>/gs)
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
          players[cleanName.toUpperCase().trim()] = info;
          players[normalizeKey(cleanName)] = info;
        });
      });

      // 6. Dubts in match
      const dubtsSections = Array.from(matchHtml.matchAll(/<section[^>]*class="[^"]*dubts[^"]*"[^>]*>(.*?)<\/section>/gs));
      dubtsSections.forEach((dubtSec) => {
        const dubtItems = Array.from(
          dubtSec[1].matchAll(/<li[^>]*>\s*<a[^>]*href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span><\/a>.*?<p[^>]*class="description"[^>]*>(.*?)<\/p>/gs)
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
          players[cleanName.toUpperCase().trim()] = info;
          players[normalizeKey(cleanName)] = info;
        });
      });
    }
  }

  const mwMatch = probabiliHtml.match(/<div[^>]*class="[^"]*matchweek[^"]*"[^>]*>(.*?)<\/div>/);
  const matchweek = mwMatch ? stripTags(mwMatch[1]) : '2';

  return {
    updatedAt: new Date().toISOString(),
    matchweek: matchweek ? `Giornata ${matchweek}` : 'Prossima Giornata',
    playersCount: Object.keys(players).length,
    players
  };
}

export const parseProbabiliHtml = (html: string) => parseProbabiliAndInfortunatiHtml(html);

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

  // 1. Look up by idFantacalcio
  if (player.idFantacalcio && probabiliMap[String(player.idFantacalcio)]) {
    return probabiliMap[String(player.idFantacalcio)];
  }

  // 2. Look up by generic id
  const pid = String(player.id);
  if (probabiliMap[pid]) {
    return probabiliMap[pid];
  }

  // 3. Look up by exact uppercase name
  const upperName = player.name.toUpperCase().trim();
  if (probabiliMap[upperName]) {
    return probabiliMap[upperName];
  }

  // 4. Look up by normalized alphanumeric key
  const norm = normalizeKey(player.name);
  if (probabiliMap[norm]) {
    return probabiliMap[norm];
  }

  // 5. Look up by last name (first word, e.g. "ZANIOLO", "BERARDI")
  const lastName = upperName.split(' ')[0];
  if (lastName.length >= 3 && probabiliMap[lastName]) {
    return probabiliMap[lastName];
  }

  // 6. Look up by normalized last name
  const normLastName = normalizeKey(lastName);
  if (normLastName.length >= 3 && probabiliMap[normLastName]) {
    return probabiliMap[normLastName];
  }

  // Player belongs to listone team but is NOT present in any probabili/infortunati section (Non convocato / Fuori rosa)
  return {
    id: String(player.id),
    name: player.name,
    team: player.team,
    status: 'non_convocato',
    statusLabel: 'Non convocato / Fuori lista',
    titolarita: 0
  };
}
