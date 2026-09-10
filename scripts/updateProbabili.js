import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        rejectUnauthorized: false,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    ).on("error", reject);
  });
}

const unescapeHtml = (str) => {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&eacute;/g, "é")
    .replace(/&agrave;/g, "à")
    .replace(/&egrave;/g, "è")
    .replace(/&ograve;/g, "ò")
    .replace(/&ugrave;/g, "ù")
    .replace(/&igrave;/g, "ì")
    .replace(/&nbsp;/g, " ");
};

const stripTags = (str) => unescapeHtml(str.replace(/<[^>]+>/g, "").trim());
const normalizeKey = (str) => str.toUpperCase().replace(/[^A-Z0-9]/g, "");

function parseProbabiliAndInfortunatiHtml(probabiliHtml, infortunatiHtml) {
  const players = {};

  if (infortunatiHtml) {
    const teamSections = infortunatiHtml.split(/<div[^>]*class="[^"]*card team-card[^"]*"[^>]*>/);
    for (let i = 1; i < teamSections.length; i++) {
      const sec = teamSections[i];
      const tNameMatch = sec.match(/<h[234][^>]*class="[^"]*team-name[^"]*"[^>]*>(.*?)<\/h[234]>/s);
      const teamName = tNameMatch ? stripTags(tNameMatch[1]) : "";

      const items = Array.from(
        sec.matchAll(/<li>\s*<strong[^>]*class="item-name"[^>]*>(.*?)<\/strong>\s*<div[^>]*class="item-description"[^>]*>(.*?)<\/div>\s*<\/li>/gs)
      );

      items.forEach(([, rawName, rawDesc]) => {
        const pname = stripTags(rawName);
        const desc = stripTags(rawDesc);
        const info = {
          id: pname,
          name: pname,
          team: teamName,
          status: "infortunato",
          statusLabel: "Infortunato: " + desc,
          description: desc,
          titolarita: 0
        };

        const upper = pname.toUpperCase().trim();
        players[upper] = info;
        players[normalizeKey(pname)] = info;
        const parts = upper.split(" ");
        if (parts.length > 1 && parts[0].length >= 3) {
          players[parts[0]] = info;
        }
      });
    }
  }

  let matchweek = "";
  if (probabiliHtml) {
    const mwMatch = probabiliHtml.match(/<div[^>]*class="[^"]*matchweek[^"]*"[^>]*>(.*?)<\/div>/s);
    if (mwMatch) {
      matchweek = stripTags(mwMatch[1]).trim();
    }

    const matchesRaw = probabiliHtml.split(/<li[^>]*class="[^"]*match-item[^"]*"[^>]*>/);
    for (let mIdx = 1; mIdx < matchesRaw.length; mIdx++) {
      const matchHtml = matchesRaw[mIdx];

      const mDateMatch = matchHtml.match(/<div[^>]*class="[^"]*match-date[^"]*"[^>]*>(.*?)<\/div>/s);
      let matchDate = "";
      if (mDateMatch) {
        const rawDate = stripTags(mDateMatch[1]).replace(/\s+/g, " ").trim();
        if (
          rawDate &&
          !rawDate.includes("01/01 01:00") &&
          !rawDate.includes("1970-01-01") &&
          !rawDate.includes("01/01")
        ) {
          matchDate = rawDate;
        }
      }

      const teamMatches = Array.from(matchHtml.matchAll(/<a[^>]*class="[^"]*team-name[^"]*"[^>]*>(.*?)<\/a>/gs));
      const teamNames = teamMatches.map((t) => stripTags(t[1])).filter(Boolean);
      const matchTitle = teamNames.length >= 2 ? teamNames.join(" vs ") : "";

      const startersBlocks = Array.from(matchHtml.matchAll(/<ul[^>]*class="[^"]*starters[^"]*"[^>]*>(.*?)<\/ul>/gs));
      startersBlocks.forEach((sBlock, idx) => {
        const team = teamNames[idx] || "";
        const pItems = Array.from(sBlock[1].matchAll(/<li[^>]*class="player-item[^"]*"[^>]*>(.*?)<\/li>/gs));
        pItems.forEach((it) => {
          const link = it[1].match(
            /href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>/s
          );
          if (!link) return;
          const [, pslug, pid, pname] = link;
          const valMatch = it[1].match(/aria-valuenow="(\d+)"/);
          const val = valMatch ? parseInt(valMatch[1]) : 90;
          const cleanName = stripTags(pname);

          const info = {
            id: pid,
            name: cleanName,
            slug: pslug,
            team,
            status: "titolare",
            statusLabel: "Titolare (" + val + "%)",
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

      const reservesBlocks = Array.from(matchHtml.matchAll(/<ul[^>]*class="[^"]*reserves[^"]*"[^>]*>(.*?)<\/ul>/gs));
      reservesBlocks.forEach((rBlock, idx) => {
        const team = teamNames[idx] || "";
        const pItems = Array.from(rBlock[1].matchAll(/<li[^>]*class="player-item[^"]*"[^>]*>(.*?)<\/li>/gs));
        pItems.forEach((it) => {
          const link = it[1].match(
            /href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>/s
          );
          if (!link) return;
          const [, pslug, pid, pname] = link;
          const valMatch = it[1].match(/aria-valuenow="(\d+)"/);
          const val = valMatch ? parseInt(valMatch[1]) : 10;
          const cleanName = stripTags(pname);

          if (!players[pid] || players[pid].status === "panchina") {
            const info = {
              id: pid,
              name: cleanName,
              slug: pslug,
              team,
              status: "panchina",
              statusLabel: "Panchina (" + val + "%)",
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

      const ballotSections = Array.from(matchHtml.matchAll(/<section[^>]*class="[^"]*ballots[^"]*"[^>]*>(.*?)<\/section>/gs));
      ballotSections.forEach((bSec) => {
        const bItems = Array.from(bSec[1].matchAll(/<div[^>]*class="ballot"[^>]*>(.*?)<\/ul>/gs));
        bItems.forEach((b) => {
          const links = Array.from(
            b[1].matchAll(
              /href="https:\/\/www\.fantacalcio\.it\/serie-a\/squadre\/[^/]+\/([^/]+)\/(\d+)"[^>]*>.*?<span>(.*?)<\/span>.*?<strong[^>]*class="percentage"[^>]*>\s*(\d+)%\s*<\/strong>/gs
            )
          );
          if (links.length >= 2) {
            const [, p1_slug, p1_id, p1_name, p1_pctStr] = links[0];
            const [, p2_slug, p2_id, p2_name, p2_pctStr] = links[1];
            const p1_pct = parseInt(p1_pctStr);
            const p2_pct = parseInt(p2_pctStr);
            const cleanP1 = stripTags(p1_name);
            const cleanP2 = stripTags(p2_name);

            const info1 = {
              id: p1_id,
              name: cleanP1,
              slug: p1_slug,
              team: players[p1_id]?.team || "",
              status: "ballottaggio",
              statusLabel: "Ballottaggio " + p1_pct + "% (con " + cleanP2 + " " + p2_pct + "%)",
              titolarita: p1_pct,
              ballotPartner: cleanP2,
              ballotPct: p1_pct,
              match: matchTitle,
              matchDate
            };
            const info2 = {
              id: p2_id,
              name: cleanP2,
              slug: p2_slug,
              team: players[p2_id]?.team || "",
              status: "ballottaggio",
              statusLabel: "Ballottaggio " + p2_pct + "% (con " + cleanP1 + " " + p1_pct + "%)",
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
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    matchweek: matchweek ? "Giornata " + matchweek : "Prossima Giornata",
    playersCount: Object.keys(players).length,
    players
  };
}

async function run() {
  console.log("Fetching live probabili & infortunati from Fantacalcio.it...");
  const [htmlProb, htmlInf] = await Promise.all([
    fetchUrl("https://www.fantacalcio.it/probabili-formazioni-serie-a"),
    fetchUrl("https://www.fantacalcio.it/infortunati-serie-a")
  ]);

  const parsed = parseProbabiliAndInfortunatiHtml(htmlProb, htmlInf);
  console.log("[Success] Parsed " + parsed.matchweek + " (" + parsed.playersCount + " players indexed)");

  const outPath = path.join(__dirname, "../src/data/defaultProbabili.json");
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
  console.log("[Saved] Wrote data to " + outPath);
}

run().catch((err) => {
  console.error("[Error] Failed to update probabili:", err);
  process.exit(1);
});
