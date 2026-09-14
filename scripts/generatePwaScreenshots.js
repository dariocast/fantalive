import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '../public/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// 1. Mobile Screenshot 1: Auction Live Focus (1080 x 2340)
const svgMobileAuction = `
<svg width="1080" height="2340" viewBox="0 0 1080 2340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e0a2b" />
      <stop offset="50%" stop-color="#08061a" />
      <stop offset="100%" stop-color="#050412" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00f59b" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c164a" />
      <stop offset="100%" stop-color="#140f35" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="25" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="2340" fill="url(#bgGrad)" />

  <!-- Top Ambient Glow -->
  <circle cx="540" cy="200" r="400" fill="#00f59b" opacity="0.08" filter="url(#glow)" />

  <!-- Status Bar / Notch Area -->
  <rect x="0" y="0" width="1080" height="120" fill="#0b0824" />
  <text x="80" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">09:41</text>
  <text x="960" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" text-anchor="end">5G 100%</text>

  <!-- Header Bar -->
  <rect x="0" y="120" width="1080" height="160" fill="#0f0c29" />
  <line x1="0" y1="280" x2="1080" y2="280" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  
  <rect x="50" y="150" width="100" height="100" rx="28" fill="url(#primaryGrad)" />
  <text x="100" y="215" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" text-anchor="middle">⚽</text>
  
  <text x="180" y="200" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">FantaLive Companion</text>
  <text x="180" y="240" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">ASTA LIVE • LATENZA ZERO</text>

  <!-- Active Player Card -->
  <rect x="50" y="320" width="980" height="1650" rx="48" fill="url(#cardGrad)" stroke="rgba(0, 245, 155, 0.4)" stroke-width="3" />
  
  <!-- Player Badge & Role -->
  <rect x="90" y="370" width="140" height="60" rx="16" fill="#ef4444" />
  <text x="160" y="412" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" text-anchor="middle">Pc / A</text>

  <rect x="250" y="370" width="180" height="60" rx="16" fill="rgba(255,255,255,0.1)" />
  <text x="340" y="412" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="bold" text-anchor="middle">INTER</text>

  <rect x="740" y="370" width="250" height="60" rx="16" fill="rgba(245, 158, 11, 0.15)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="2" />
  <text x="865" y="412" fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">FVM: 145 FM</text>

  <!-- Player Name & Details -->
  <text x="90" y="520" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900">Lautaro Martinez</text>
  <text x="90" y="580" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="600">Attaccante • Titolare Inamovibile (98%) • Rigorista</text>

  <!-- Current Bid Huge Display -->
  <rect x="90" y="640" width="900" height="320" rx="36" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
  
  <text x="140" y="720" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold">OFFERTA CORRENTE</text>
  <text x="140" y="850" fill="#00f59b" font-family="ui-monospace, monospace" font-size="120" font-weight="900">185</text>
  <text x="360" y="850" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="bold">FM</text>

  <!-- Timer Neon Pill -->
  <rect x="720" y="700" width="230" height="200" rx="30" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" stroke-width="3" />
  <text x="835" y="760" fill="#f43f5e" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" text-anchor="middle">TIMER ASTA</text>
  <text x="835" y="860" fill="#ffffff" font-family="ui-monospace, monospace" font-size="76" font-weight="900" text-anchor="middle">00:03</text>

  <!-- Smart Stats Bar -->
  <rect x="90" y="1000" width="900" height="200" rx="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  
  <text x="140" y="1070" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">TUO MAX BID</text>
  <text x="140" y="1150" fill="#38bdf8" font-family="ui-monospace, monospace" font-size="56" font-weight="900">296 FM</text>

  <line x1="420" y1="1030" x2="420" y2="1170" stroke="rgba(255,255,255,0.1)" stroke-width="2" />

  <text x="470" y="1070" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">BUDGET RESIDUO</text>
  <text x="470" y="1150" fill="#00f59b" font-family="ui-monospace, monospace" font-size="56" font-weight="900">320 FM</text>

  <line x1="750" y1="1030" x2="750" y2="1170" stroke="rgba(255,255,255,0.1)" stroke-width="2" />

  <text x="800" y="1070" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">SLOT LIBERI</text>
  <text x="800" y="1150" fill="#fbbf24" font-family="ui-monospace, monospace" font-size="56" font-weight="900">7 / 25</text>

  <!-- Quick Bid Buttons -->
  <rect x="90" y="1240" width="430" height="150" rx="32" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
  <text x="305" y="1335" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" text-anchor="middle">+1 FM</text>

  <rect x="560" y="1240" width="430" height="150" rx="32" fill="url(#primaryGrad)" />
  <text x="775" y="1335" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" text-anchor="middle">+5 FM Rilancia</text>

  <!-- Assign Player Button -->
  <rect x="90" y="1430" width="900" height="160" rx="36" fill="rgba(0, 245, 155, 0.15)" stroke="#00f59b" stroke-width="3" />
  <text x="540" y="1530" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" text-anchor="middle">✓ Assegna a Mia Rosa (185 FM)</text>

  <!-- Opponents Quick Bid Grid -->
  <rect x="90" y="1630" width="900" height="300" rx="32" fill="rgba(0,0,0,0.3)" />
  <text x="130" y="1690" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold">RILANCI RAPIDI AVVERSARI</text>
  
  <rect x="130" y="1730" width="250" height="160" rx="24" fill="rgba(255,255,255,0.06)" />
  <text x="255" y="1790" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="bold" text-anchor="middle">Marco F.</text>
  <text x="255" y="1850" fill="#38bdf8" font-family="ui-monospace, monospace" font-size="36" font-weight="900" text-anchor="middle">186 FM</text>

  <rect x="415" y="1730" width="250" height="160" rx="24" fill="rgba(255,255,255,0.06)" />
  <text x="540" y="1790" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="bold" text-anchor="middle">Luca B.</text>
  <text x="540" y="1850" fill="#38bdf8" font-family="ui-monospace, monospace" font-size="36" font-weight="900" text-anchor="middle">190 FM</text>

  <rect x="700" y="1730" width="250" height="160" rx="24" fill="rgba(255,255,255,0.06)" />
  <text x="825" y="1790" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="bold" text-anchor="middle">Andrea G.</text>
  <text x="825" y="1850" fill="#38bdf8" font-family="ui-monospace, monospace" font-size="36" font-weight="900" text-anchor="middle">195 FM</text>

  <!-- Bottom Navigation Bar -->
  <rect x="0" y="2060" width="1080" height="280" fill="#0d0928" />
  <line x1="0" y1="2060" x2="1080" y2="2060" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  
  <text x="135" y="2180" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">🎯</text>
  <text x="135" y="2250" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Battuta</text>

  <text x="405" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">📋</text>
  <text x="405" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Listone</text>

  <text x="675" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">🛡️</text>
  <text x="675" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Mia Rosa</text>

  <text x="945" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">👥</text>
  <text x="945" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Avversari</text>
</svg>
`;

// 2. Mobile Screenshot 2: Roster & Slot Calculation (1080 x 2340)
const svgMobileRoster = `
<svg width="1080" height="2340" viewBox="0 0 1080 2340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e0a2b" />
      <stop offset="100%" stop-color="#050412" />
    </linearGradient>
    <linearGradient id="primaryGrad2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00f59b" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
  </defs>

  <rect width="1080" height="2340" fill="url(#bgGrad2)" />

  <!-- Status Bar -->
  <rect x="0" y="0" width="1080" height="120" fill="#0b0824" />
  <text x="80" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">09:41</text>
  <text x="960" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" text-anchor="end">5G 100%</text>

  <!-- Header Bar -->
  <rect x="0" y="120" width="1080" height="160" fill="#0f0c29" />
  <text x="60" y="225" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900">🛡️ Mia Rosa &amp; Budget</text>

  <!-- Squad Summary Big Box -->
  <rect x="50" y="320" width="980" height="360" rx="40" fill="#181340" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  
  <text x="90" y="390" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="bold">BUDGET RESIDUO</text>
  <text x="90" y="490" fill="#00f59b" font-family="ui-monospace, monospace" font-size="80" font-weight="900">320 <tspan font-size="44">FM</tspan></text>
  
  <rect x="550" y="360" width="440" height="140" rx="28" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2" />
  <text x="770" y="415" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">MAX BID SICURO</text>
  <text x="770" y="480" fill="#ffffff" font-family="ui-monospace, monospace" font-size="52" font-weight="900" text-anchor="middle">296 FM</text>

  <!-- Progress Slot Bar -->
  <rect x="90" y="550" width="900" height="24" rx="12" fill="rgba(255,255,255,0.1)" />
  <rect x="90" y="550" width="650" height="24" rx="12" fill="url(#primaryGrad2)" />
  <text x="90" y="625" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">Slot Completati: 18 / 25 (7 rimanenti)</text>
  <text x="990" y="625" fill="#00f59b" font-family="ui-monospace, monospace" font-size="28" font-weight="900" text-anchor="end">45.7 FM / slot</text>

  <!-- Players in Roster List -->
  <text x="60" y="740" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold">CALCIATORI IN ROSA (18)</text>

  <!-- Portieri Section -->
  <rect x="50" y="780" width="980" height="240" rx="32" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <rect x="80" y="810" width="100" height="50" rx="12" fill="#f59e0b" />
  <text x="130" y="845" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Por</text>
  <text x="200" y="848" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold">Blocco Portieri Inter (Sommer, Martinez, Di Gennaro)</text>
  <text x="980" y="848" fill="#00f59b" font-family="ui-monospace, monospace" font-size="34" font-weight="900" text-anchor="end">35 FM</text>

  <!-- Difensori -->
  <rect x="50" y="1050" width="980" height="150" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <rect x="80" y="1090" width="90" height="50" rx="12" fill="#3b82f6" />
  <text x="125" y="1125" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Ds/E</text>
  <text x="200" y="1128" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold">Dimarco (Inter)</text>
  <text x="980" y="1128" fill="#00f59b" font-family="ui-monospace, monospace" font-size="34" font-weight="900" text-anchor="end">42 FM</text>

  <rect x="50" y="1220" width="980" height="150" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <rect x="80" y="1260" width="90" height="50" rx="12" fill="#3b82f6" />
  <text x="125" y="1295" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Dd/E</text>
  <text x="200" y="1298" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold">Bellanova (Atalanta)</text>
  <text x="980" y="1298" fill="#00f59b" font-family="ui-monospace, monospace" font-size="34" font-weight="900" text-anchor="end">18 FM</text>

  <!-- Centrocampisti -->
  <rect x="50" y="1390" width="980" height="150" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <rect x="80" y="1430" width="90" height="50" rx="12" fill="#10b981" />
  <text x="125" y="1465" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">C/T</text>
  <text x="200" y="1468" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold">Pulisic (Milan)</text>
  <text x="980" y="1468" fill="#00f59b" font-family="ui-monospace, monospace" font-size="34" font-weight="900" text-anchor="end">65 FM</text>

  <!-- Attaccanti -->
  <rect x="50" y="1560" width="980" height="150" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <rect x="80" y="1600" width="90" height="50" rx="12" fill="#ef4444" />
  <text x="125" y="1635" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Pc</text>
  <text x="200" y="1638" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="bold">Lautaro Martinez (Inter)</text>
  <text x="980" y="1638" fill="#00f59b" font-family="ui-monospace, monospace" font-size="34" font-weight="900" text-anchor="end">185 FM</text>

  <!-- Bottom Navigation Bar -->
  <rect x="0" y="2060" width="1080" height="280" fill="#0d0928" />
  <line x1="0" y1="2060" x2="1080" y2="2060" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  
  <text x="135" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">🎯</text>
  <text x="135" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Battuta</text>

  <text x="405" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">📋</text>
  <text x="405" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Listone</text>

  <text x="675" y="2180" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">🛡️</text>
  <text x="675" y="2250" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Mia Rosa</text>

  <text x="945" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">👥</text>
  <text x="945" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Avversari</text>
</svg>
`;

// 3. Mobile Screenshot 3: Listone & Formazioni (1080 x 2340)
const svgMobileListone = `
<svg width="1080" height="2340" viewBox="0 0 1080 2340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e0a2b" />
      <stop offset="100%" stop-color="#050412" />
    </linearGradient>
  </defs>

  <rect width="1080" height="2340" fill="url(#bgGrad3)" />

  <!-- Status Bar -->
  <rect x="0" y="0" width="1080" height="120" fill="#0b0824" />
  <text x="80" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">09:41</text>
  <text x="960" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold" text-anchor="end">5G 100%</text>

  <!-- Header Bar -->
  <rect x="0" y="120" width="1080" height="160" fill="#0f0c29" />
  <text x="60" y="225" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900">📋 Listone &amp; Probabili Live</text>

  <!-- Search Bar -->
  <rect x="50" y="310" width="980" height="110" rx="30" fill="#1a1444" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  <text x="100" y="378" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="34">🔍 Cerca calciatore o squadra...</text>

  <!-- Role Filter Pills -->
  <rect x="50" y="450" width="160" height="70" rx="20" fill="#00f59b" />
  <text x="130" y="495" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">TUTTI</text>

  <rect x="230" y="450" width="120" height="70" rx="20" fill="rgba(255,255,255,0.08)" />
  <text x="290" y="495" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">POR</text>

  <rect x="370" y="450" width="120" height="70" rx="20" fill="rgba(255,255,255,0.08)" />
  <text x="430" y="495" fill="#3b82f6" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">DIF</text>

  <rect x="510" y="450" width="120" height="70" rx="20" fill="rgba(255,255,255,0.08)" />
  <text x="570" y="495" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">CEN</text>

  <rect x="650" y="450" width="120" height="70" rx="20" fill="rgba(255,255,255,0.08)" />
  <text x="710" y="495" fill="#ef4444" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">ATT</text>

  <!-- Player List Items -->
  <rect x="50" y="560" width="980" height="180" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  <rect x="80" y="605" width="80" height="50" rx="12" fill="#ef4444" />
  <text x="120" y="640" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" text-anchor="middle">A</text>
  <text x="180" y="645" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">Lautaro Martinez (Inter)</text>
  <text x="180" y="695" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">🟢 Titolare 98% • Rigorista</text>
  <text x="980" y="660" fill="#fbbf24" font-family="ui-monospace, monospace" font-size="38" font-weight="900" text-anchor="end">FVM 145</text>

  <rect x="50" y="760" width="980" height="180" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  <rect x="80" y="805" width="80" height="50" rx="12" fill="#ef4444" />
  <text x="120" y="840" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" text-anchor="middle">A</text>
  <text x="180" y="845" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">Lookman (Atalanta)</text>
  <text x="180" y="895" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">🟢 Titolare 90%</text>
  <text x="980" y="860" fill="#fbbf24" font-family="ui-monospace, monospace" font-size="38" font-weight="900" text-anchor="end">FVM 110</text>

  <rect x="50" y="960" width="980" height="180" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  <rect x="80" y="1005" width="80" height="50" rx="12" fill="#10b981" />
  <text x="120" y="1040" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" text-anchor="middle">C</text>
  <text x="180" y="1045" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">Pulisic (Milan)</text>
  <text x="180" y="1095" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">🟢 Titolare 95% • Rigori</text>
  <text x="980" y="1060" fill="#fbbf24" font-family="ui-monospace, monospace" font-size="38" font-weight="900" text-anchor="end">FVM 85</text>

  <rect x="50" y="1160" width="980" height="180" rx="28" fill="#140f35" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  <rect x="80" y="1205" width="80" height="50" rx="12" fill="#3b82f6" />
  <text x="120" y="1240" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" text-anchor="middle">D</text>
  <text x="180" y="1245" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="bold">Dimarco (Inter)</text>
  <text x="180" y="1295" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">🟢 Titolare 90% • Piazzati</text>
  <text x="980" y="1260" fill="#fbbf24" font-family="ui-monospace, monospace" font-size="38" font-weight="900" text-anchor="end">FVM 45</text>

  <!-- Bottom Navigation Bar -->
  <rect x="0" y="2060" width="1080" height="280" fill="#0d0928" />
  <line x1="0" y1="2060" x2="1080" y2="2060" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  
  <text x="135" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">🎯</text>
  <text x="135" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Battuta</text>

  <text x="405" y="2180" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">📋</text>
  <text x="405" y="2250" fill="#00f59b" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">Listone</text>

  <text x="675" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">🛡️</text>
  <text x="675" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Mia Rosa</text>

  <text x="945" y="2180" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle">👥</text>
  <text x="945" y="2250" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">Avversari</text>
</svg>
`;

// 4. Desktop Screenshot: 3-column layout (1920 x 1080)
const svgDesktop = `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0e0a2b" />
      <stop offset="100%" stop-color="#050412" />
    </linearGradient>
    <linearGradient id="dPrm" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00f59b" />
      <stop offset="100%" stop-color="#00b4d8" />
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#dGrad)" />

  <!-- Desktop Header -->
  <rect x="0" y="0" width="1920" height="80" fill="#0f0c29" />
  <line x1="0" y1="80" x2="1920" y2="80" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
  
  <rect x="30" y="15" width="50" height="50" rx="14" fill="url(#dPrm)" />
  <text x="55" y="50" fill="#000000" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">⚽</text>
  <text x="95" y="50" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900">FantaLive Companion</text>

  <!-- Left Col: Listone (500px) -->
  <rect x="30" y="100" width="460" height="950" rx="24" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <text x="60" y="150" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold">📋 Listone Giocatori</text>

  <!-- Center Col: Focus Live (900px) -->
  <rect x="510" y="100" width="900" height="950" rx="24" fill="#1c164a" stroke="rgba(0, 245, 155, 0.4)" stroke-width="2" />
  <text x="550" y="160" fill="#ef4444" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900">Pc / A • INTER</text>
  <text x="550" y="220" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">Lautaro Martinez</text>
  <rect x="550" y="260" width="820" height="180" rx="20" fill="rgba(0,0,0,0.5)" />
  <text x="590" y="320" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold">OFFERTA CORRENTE</text>
  <text x="590" y="395" fill="#00f59b" font-family="ui-monospace, monospace" font-size="70" font-weight="900">185 FM</text>

  <!-- Right Col: Mia Rosa & Avversari (460px) -->
  <rect x="1430" y="100" width="460" height="950" rx="24" fill="#140f35" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <text x="1460" y="150" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold">🛡️ Mia Rosa (18/25)</text>
</svg>
`;

async function generate() {
  console.log('Generating high-res PWA screenshots...');
  
  await sharp(Buffer.from(svgMobileAuction))
    .png({ quality: 100 })
    .toFile(path.join(screenshotsDir, 'mobile-auction-focus.png'));
  console.log('✓ mobile-auction-focus.png (1080x2340)');

  await sharp(Buffer.from(svgMobileRoster))
    .png({ quality: 100 })
    .toFile(path.join(screenshotsDir, 'mobile-roster-slots.png'));
  console.log('✓ mobile-roster-slots.png (1080x2340)');

  await sharp(Buffer.from(svgMobileListone))
    .png({ quality: 100 })
    .toFile(path.join(screenshotsDir, 'mobile-player-list.png'));
  console.log('✓ mobile-player-list.png (1080x2340)');

  await sharp(Buffer.from(svgDesktop))
    .png({ quality: 100 })
    .toFile(path.join(screenshotsDir, 'desktop-dashboard.png'));
  console.log('✓ desktop-dashboard.png (1920x1080)');

  console.log('All screenshots generated successfully!');
}

generate().catch(console.error);
