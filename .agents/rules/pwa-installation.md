# PWA Installation Experience Guidelines (Supercell Store Pattern)

Quando si implementa o migliora l'esperienza di installazione di una PWA (Progressive Web App), adottare sempre il seguente standard a due livelli:

## 1. Chromium Richer Install UI (Dialog Nativo di Sistema)
Per garantire che da Chrome Mobile / Desktop si apra il **dialog nativo di sistema con carosello di screenshot** in stile Google Play / Supercell Store:
- Configurare sempre `public/manifest.json` con:
  - `description`: descrizione chiara e accattivante delle funzionalità.
  - `screenshots`: array contenente file immagine reali ad alta risoluzione (PNG/WebP):
    - Almeno 3 screenshot mobile con `form_factor: "narrow"` (es. `1080x2340`, ratio ~9:19.5) ed etichette `label` descrittive.
    - Almeno 1 screenshot desktop con `form_factor: "wide"` (es. `1920x1080`).
  - `categories`: es. `["sports", "utilities", "entertainment"]`.
  - `icons`: icone 192x192 e 512x512 sia `purpose: "any"` che `purpose: "maskable"`.
  - `shortcuts`: collegamenti rapidi per l'avvio rapido di funzionalità chiave.
  - `display_override`: `["window-controls-overlay", "standalone", "minimal-ui"]`.

## 2. In-App Educational Modal & Carousel
- Creare una modal dedicata con mockup grafici/interattivi delle funzionalità chiave (es. carousel a scorrimento orizzontale, vantaggi come Offline, Fullscreen, Zero Latenza, Zero MB dagli store).
- Fornire istruzioni specifiche in base al sistema operativo:
  - **Android / Chrome / Edge**: Pulsante diretto che invoca `beforeinstallprompt.prompt()`.
  - **iOS Safari**: Guida visuale step-by-step con icone (Condividi 📤 ➔ Aggiungi alla schermata Home ➕ ➔ Conferma).
  - **Standalone Mode**: Rilevamento di `display-mode: standalone` per evitare prompt inutili se già installata.
- Banner/toast galleggiante discreto per non disturbare la navigazione, con memorizzazione dismiss in `localStorage`.
