# ⚽ FantaLive Companion

**FantaLive Companion** è un'applicazione web ad alta densità informativa e a **latenza decisionale zero**, progettata specificamente per supportare i fantallenatori durante le sessioni d'asta live del Fantacalcio (Classic e Mantra).

---

## 🚀 Avvio Rapido

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Compila per la produzione
npm run build
```

L'applicazione sarà disponibile localmente all'indirizzo `http://localhost:3000`.

---

## 🎯 Funzionalità Principali

### 1. ⚙️ Configurazione Pre-Asta Personalizzabile
- Scelta modalità: **Classic** o **Mantra**.
- Criterio base asta: *Base 1 credito*, *Draft (valore di mercato)* o *Quotazione*.
- Budget totale: *250*, *500*, *1000* o valore personalizzato a piacere.
- Regole di lega: *Modificatore difesa* e *Imbattibilità portiere*.
- Tipologia d'asta: *A chiamata*, *Random* o *Ordine alfabetico*.
- Partecipanti configurabili (da 2 a 20 fantallenatori) con personalizzazione diretta dei nomi e dei requisiti di slot per ruolo (P, D, C, A).
- **Importazione Listone Excel**: Caricamento drag-and-drop di qualsiasi file `.xlsx`, `.xls` o `.csv` elaborato interamente client-side nel browser per la massima privacy.

### 2. 🔍 Vista Focus Calciatore (Glanceable Spotlight)
- Tipografia gigante ad alto contrasto e tema scuro progettato per essere letto a distanza senza affaticare la vista.
- Indicatori cromatici di titolarità e percentuali su piazzati / rigori.
- **Metriche Chiave**: Prezzo Medio Asta (PMA), Prezzo Algoritmo (PFC), FantaMedia Prevista e storico stagionale.
- **Target Price Dinamico**: algoritmo intelligente che consiglia in tempo reale l'offerta massima raccomandata in base al budget residuo e agli slot ancora da coprire.
- **Integrazione Probabili Formazioni**: sincronizzazione in tempo reale dello status della prossima giornata (titolare, panchina, ballottaggio con percentuali esatte, infortuni e squalifiche).

### 3. ⚡ Motore di Battuta & Assegnazione Istantanea
- Stepper rapidi per l'offerta (`+1`, `+2`, `+5`, `+10`, `+20`, `+50`, `PMA`, `PFC`, `Reset`).
- Pulsante primario gigante **"ASSEGNA A ME"** con feedback audio ed effetti celebrativi.
- Assegnazione con singolo tocco o tasto fisico agli avversari (`1-9`).
- Gestione calciatori **Invenduti** e pulsante **Rollback / Undo istantaneo** (`Ctrl+Z`).

### 4. 🔄 Lista Invenduti Dedicata & Nuovi Giri d'Asta
- Sezione dedicata per visualizzare e filtrare per ruolo tutti i calciatori rimasti invenduti.
- Azione 1-click **"Rimetti tutti in gioco per Nuovo Giro"** per avviare rapidamente i successivi giri d'asta o di riparazione.
- Possibilità di rimettere in battuta singoli calciatori con un clic.

### 5. 📊 Tabellone Rose & Strategia Avversari
- Monitoraggio della spesa per ruolo e budget residuo per ogni partecipante.
- Calcolo automatico della **Max Offerta consentita** (`max bid`) per ciascun avversario.
- Feed cronologico live di tutti gli acquisti registrati.
- Esportazione finale della sessione d'asta in formato **Excel (.xlsx)** e testo formattato per chat e WhatsApp.

---

## ⌨️ Scorciatoie da Tastiera (Desktop)

| Tasto | Azione |
| :--- | :--- |
| **`Invio ↵`** | Assegna il calciatore in battuta a **TE STESSO** al prezzo corrente |
| **`1 - 9`** | Assegna il calciatore all'avversario corrispondente |
| **`Esc`** | Segna come **Invenduto** e passa al successivo |
| **`Ctrl + Z`** / **`Cmd + Z`** | **Undo** dell'ultima assegnazione |
| **`Freccia Su`** / **`K`** | Calciatore precedente |
| **`Freccia Giù`** / **`J`** | Calciatore successivo |
| **`+`** / **`-`** | Aumenta / diminuisci offerta di 1 credito |
| **`/`** oppure **`Spazio`** | Focus immediato sulla barra di ricerca |

---

## 🛠️ Stack Tecnologico

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) con persistenza automatica `localStorage`
- **Spreadsheet Engine**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Audio Engine**: Web Audio API Synthesizer (suoni di battuta, tick e assegnazione)
- **Deployment**: [GitHub Pages](https://pages.github.com/) via GitHub Actions

---

## 📄 Licenza

Distribuito sotto licenza MIT.
