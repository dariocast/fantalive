# Product Requirements Document (PRD)

## 1. Panoramica del Prodotto
**FantaLive Companion** è una Progressive Web App (PWA) mobile-first e desktop pensata per supportare un fantallenatore durante le sessioni d'asta live a 10 partecipanti. L'applicazione elimina la latenza decisionale, offrendo a colpo d'occhio statistiche avanzate (PMA, PFC, FantaMedia prevista, status infortunio/probabili formazioni) e gestendo in tempo reale l'assegnazione dei giocatori, il ricalcolo dinamico del budget e il tracciamento dei concorrenti.

---

## 2. Obiettivi e Metriche di Successo
* **Latenza di interazione zero:** Registrazione di un acquisto in meno di 2 secondi (massimo 2-3 tap/tasti).
* **Affidabilità Offline-First:** Piena operatività anche in assenza di connettività di rete durante la sessione d'asta.
* **Supporto Cross-Platform:** Esperienza ottimizzata per smartphone (touch a una mano) e desktop/tablet (scorciatoie da tastiera e visuale espansa).

---

## 3. Architettura Tecnica e Stack

### Frontend & PWA
* **Framework:** Next.js (App Router) o React + Vite.
* **Styling & UI:** Tailwind CSS, shadcn/ui, Radix UI per componenti accessibili ad alta densità informativa.
* **PWA:** `next-pwa` o `vite-plugin-pwa` con configurazione fullscreen (`standalone`).

### State Management & Storage
* **Global State:** Zustand con middleware `persist` per sincronizzazione immediata in `localStorage` o `IndexedDB` (`idb-keyval`).
* **Ingest Dati:** Parser in-browser via libreria `xlsx` (SheetJS) per fogli di calcolo (`.xlsx`, `.csv`).

### Data Enrichment (Probabili Formazioni)
* **Pipeline Batch Offline:** Upload contestuale di un file `probabili.json` o scraping script pre-asta (Node.js/Cheerio su `fantacalcio.it/probabili-formazioni-serie-a`) associato tramite `idFantacalcio` o chiave composita `name` + `team`.

---

## 4. Requisiti Funzionali

### 4.1 Ingest & Configurazione Iniziale
* **Caricamento Listone:** Drag-and-drop o selezione file del listone Excel/CSV (fogli `P`, `D`, `C`, `A` o `ALL`).
* **Regolamento Personalizzato:**
  * Partecipanti (default: 10).
  * Budget iniziale per partecipante (default: 200 FM).
  * Composizione rosa (default: 3P, 8D, 8C, 6A).
  * Nomi dei 10 partecipanti all'asta.

### 4.2 Vista Focus Calciatore (Live Screen)
* **Identificativi:** Nome, Squadra, Ruolo (P/D/C/A), Slot consigliato (1-8), Status (Titolare/Panchina/Infortunato).
* **Metriche di Valore:**
  * Prezzo Medio Asta (PMA) & Prezzo FantaCulo (PFC).
  * FantaMedia Prevista & Voto Base anno precedente.
  * Percentuale Rigorista / Piazzati.
  * Probabili Formazioni del prossimo turno (es. `TITOLARE 90%` o `BALLOTTAGGIO 50%`).
* **Target Price Dinamico:** Indicazione del tetto massimo d'offerta consigliato per il giocatore in base ai crediti e slot rimanenti nella propria rosa.

### 4.3 Motore di Assegnazione Rapida
* **Input Prezzo:**
  * Numpad touch / Stepper rapidi (`+1`, `+5`, `+10`, `Reset`).
  * Input numerico diretto da tastiera fisica.
* **Azioni di Assegnazione:**
  * *Assegna a Me:* Assegna il giocatore alla propria rosa e scala i crediti.
  * *Assegna ad Altri:* Selezione rapida del partecipante acquirente (griglia a 9 pulsanti / tasti 1-9).
  * *Invenduto / Salta:* Avanza al giocatore successivo senza intaccare i budget.
  * *Annulla (Undo):* Rollback dell'ultima operazione effettuata.

### 4.4 Tracciamento Rose & Avversari
* **Stato Personale:** Slot occupati per reparto, crediti residui, spesa media per slot mancante.
* **Tabellone Avversari:** Vista tabellare sintetica con budget residuo, slot attaccanti liberi e potere d'acquisto massimo per singolo partecipante.

---

## 5. Requisiti UI/UX & Layout

### 5.1 Mobile Layout (Single Column / Bottom Sheet)
* **Header compatto:** Barra di ricerca, filtro alfabetico/ruolo, crediti residui personali.
* **Card Centrale:** Focus sul giocatore corrente con badge di titolarità cromatici (Verde >80%, Giallo 50-70%, Rosso <50%).
* **Action Bar Inferiore:** Stepper prezzo a pulsanti larghi + tasti "Assegna a Me" (primario, verde) e "Assegna ad Altro" (secondario).

### 5.2 Desktop Layout (Split-Screen / Fullscreen)
* **Colonna Sinistra (30%):** Lista alfabetica scorrevole con indicatori di stato (acquistato da chi / prezzo / libero).
* **Colonna Centrale (45%):** Scheda dettagliata del giocatore in battuta, metriche avanzate e box di assegnazione.
* **Colonna Destra (25%):** Monitoraggio in tempo reale della propria rosa e del tabellone avversari.

### 5.3 Scorciatoie da Tastiera (Desktop)
* `Spazio` o `/`: Focus su ricerca rapida.
* `Frecce Su/Giù` o `J/K`: Selezione calciatore precedente/successivo.
* `Invio`: Assegna a te stesso al prezzo impostato.
* `1-9`: Assegna al corrispondente avversario 1-9.
* `Esc`: Segna come invenduto e passa al successivo.
* `Ctrl + Z`: Undo dell'ultima assegnazione.

---

## 6. Modello Dati Principale (TypeScript Interfaces)

```typescript
export type Role = 'P' | 'D' | 'C' | 'A';

export interface Player {
  id: string | number;
  name: string;
  team: string;
  role: Role;
  slot: number;
  pma: number;
  pfc: number;
  expectedFantamedia: number;
  expectedTitolarita: number;
  lastYearVotoBase?: number;
  penaltyProbability: number;
  freeKickProbability: number;
  status: 'T' | 'P' | 'p' | 'I';
  probableStatus?: string; // Es. "Titolare 90%"
  assignedTo?: string | null; // null se svincolato/libero
  purchasePrice?: number | null;
}

export interface Manager {
  id: string;
  name: string;
  isUser: boolean;
  budget: number;
  spent: number;
  roster: {
    P: Player[];
    D: Player[];
    C: Player[];
    A: Player[];
  };
}

export interface AuctionSettings {
  totalBudget: number;
  participantsCount: number;
  rosterRequirements: Record<Role, number>; // { P: 3, D: 8, C: 8, A: 6 }
}