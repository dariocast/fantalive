# ⚽ FantaLive Companion

**FantaLive Companion** è un'applicazione web e PWA ad alta densità informativa e a **latenza decisionale zero**, progettata specificamente per supportare i fantallenatori durante le sessioni d'asta live.

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

L'app si aprirà all'indirizzo `http://localhost:3000`.

---

## 🎯 Funzionalità Principali

1. **Configurazione Pre-Asta (Fedele allo Screenshot di Riferimento)**:
   - Impostazione nome dell'asta (es. *Asta #1*).
   - Scelta modalità: **Classic** / **Mantra**.
   - Modalità base asta: *Base 1 credito*, *Draft (fantavalore di mercato)*, *Base quotazione*.
   - Crediti totali: *250*, *500*, *1000* o valore personalizzato (*Scrivi*).
   - Modificatore di difesa & Imbattibilità portiere con switch dedicati.
   - Tipologia asta: *A chiamata*, *Random*, *Ordine alfabetico*.
   - Partecipanti: *6*, *8*, *10*, *12* o personalizzato (*Scrivi*), con modifica diretta dei nomi e personalizzazione slot rosa.
   - Listone Excel pre-caricato (**515 giocatori** da `Listone_Fantaculo_2026_08_26.xlsx`) e supporto a upload drag-and-drop di qualsiasi altro file `.xlsx` / `.csv`.

2. **Vista Focus Calciatore (Live Screen a Schermo Intero)**:
   - Layout ultra-visibile a colpo d'occhio con tipografia ad alto contrasto e tema scuro neon.
   - Badge cromatici di titolarità (Verde >80%, Giallo 50-79%, Rosso <50%).
   - Statistiche chiave: **PMA** (Prezzo Medio Asta), **PFC** (Prezzo FantaCulo), **FantaMedia Prevista**, **Rigorista %**, **Piazzati %**, commenti e note tecnico-tattiche.
   - **Target Price Dinamico**: calcolo in tempo reale del tetto massimo consigliato in base ai crediti residui e agli slot mancanti.

3. **Motore di Assegnazione Rapida**:
   - Stepper rapidi per il prezzo (`+1`, `+2`, `+5`, `+10`, `+20`, `+50`, `PMA`, `PFC`, `Reset`).
   - Tasto primario gigante **"ASSEGNA A ME"** (Invio) con animazione e coriandoli celebrativi.
   - Griglia di assegnazione rapida agli avversari con tasti fisici `1-9`.
   - Segna come Invenduto (`Esc`) e Rollback / Undo istantaneo (`Ctrl+Z`).

4. **Tracciamento Rose & Tabellone Avversari**:
   - Spesa per ruolo (P, D, C, A) e media crediti per slot residuo.
   - Tabellone avversari con budget residuo, spesa totale e calcolo del **potere d'acquisto massimo** (`max bid`).
   - Feed cronologico live di tutti gli eventi con possibilità di annullamento.
   - Esportazione finale in **Excel (.xlsx)** e copia testo formattato per chat/WhatsApp.

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
| **`+`** / **`-`** | Aumenta / diminuisci offerta di 1 |
| **`/`** oppure **`Spazio`** | Focus immediato sulla barra di ricerca |
