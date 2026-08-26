export type Role = 'P' | 'D' | 'C' | 'A';

export type AuctionMode = 'classic' | 'mantra';
export type BasePriceType = '1credito' | 'draft' | 'quotazione';
export type AuctionType = 'chiamata' | 'random' | 'alfabetico';

export interface Player {
  id: string | number;
  idFantacalcio?: string | number;
  name: string;
  team: string;
  teamSlug?: string;
  role: Role;
  slot: number; // 1 to 8
  pma: number; // Prezzo Medio Asta
  pfc: number; // Prezzo FantaCulo
  pmaRange?: string; // e.g. "15-20"
  pfcRange?: string;
  expectedTitolarita: number; // percentage (0-100)
  expectedFantamedia: number; // e.g. 6.75
  lastYearVotoBase?: number | null;
  lastYearFantamedia?: number | null;
  penaltyProbability: number; // percentage
  freeKickProbability: number; // percentage
  status: 'T' | 'P' | 'p' | 'I' | string;
  probableStatus?: string; // e.g. "Titolare (90%)"
  fasciaFc?: string; // e.g. "Top", "Semitop", "TitLowCost", "Riserva"
  fasciaFr?: string;
  commentoFr?: string;
  newArrival?: boolean;
  roleMantra?: string | null;
  assignedTo?: string | null; // Manager ID or null if free
  purchasePrice?: number | null;
  assignedAt?: string | null;
}

export interface ManagerRoster {
  P: Player[];
  D: Player[];
  C: Player[];
  A: Player[];
}

export interface Manager {
  id: string;
  name: string;
  isUser: boolean;
  budget: number;
  spent: number;
  color?: string;
  avatar?: string;
  roster: ManagerRoster;
}

export interface AuctionSettings {
  name: string; // e.g. "Asta #1"
  mode: AuctionMode; // classic / mantra
  trackingMode: 'solo_me' | 'full_league'; // 'solo_me' = fast companion (Me vs Opponents vs Unsold), 'full_league' = track each opponent individually
  basePriceType: BasePriceType; // 1credito / draft / quotazione
  totalBudget: number; // 250, 500, 1000, or custom
  modDifesa: boolean; // toggle
  imbattibilitaPortiere: boolean; // toggle
  tipologiaAsta: AuctionType; // chiamata / random / alfabetico
  participantsCount: number; // 6, 8, 10, 12, or custom
  rosterRequirements: Record<Role, number>; // { P: 3, D: 8, C: 8, A: 6 }
}

export interface AuctionHistoryItem {
  id: string;
  timestamp: number;
  playerId: string | number;
  playerName: string;
  playerRole: Role;
  playerTeam: string;
  managerId: string;
  managerName: string;
  price: number;
  type: 'assignment' | 'unsold' | 'release';
}

export interface FilterState {
  search: string;
  role: 'ALL' | Role;
  team: 'ALL' | string;
  slot: 'ALL' | number;
  status: 'ALL' | 'free' | 'assigned' | 'unsold';
  sortBy: 'name' | 'pma' | 'pfc' | 'fantamedia' | 'titolarita' | 'slot' | 'random';
  sortOrder: 'asc' | 'desc';
}
