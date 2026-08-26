import { Manager, Player, Role, AuctionSettings, AuctionType } from '../types';

export function sortPlayerList(players: Player[], tipologia: AuctionType = 'alfabetico'): Player[] {
  const roleOrder: Record<Role, number> = { P: 1, D: 2, C: 3, A: 4 };
  const sorted = [...players];

  if (tipologia === 'alfabetico') {
    sorted.sort((a, b) => {
      const rA = roleOrder[a.role] || 99;
      const rB = roleOrder[b.role] || 99;
      if (rA !== rB) return rA - rB;
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
    });
  } else if (tipologia === 'random') {
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }
  } else {
    // 'chiamata': role order -> slot (1 to 8) -> pma descending -> name
    sorted.sort((a, b) => {
      const rA = roleOrder[a.role] || 99;
      const rB = roleOrder[b.role] || 99;
      if (rA !== rB) return rA - rB;
      const slotDiff = (a.slot || 8) - (b.slot || 8);
      if (slotDiff !== 0) return slotDiff;
      const pmaDiff = (b.pma || 0) - (a.pma || 0);
      if (pmaDiff !== 0) return pmaDiff;
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
    });
  }

  return sorted;
}

export function getRemainingSlotsForRole(manager: Manager, role: Role, req: Record<Role, number>): number {
  const currentCount = manager.roster[role]?.length || 0;
  const maxNeeded = req[role] || 0;
  return Math.max(0, maxNeeded - currentCount);
}

export function getTotalRemainingSlots(manager: Manager, req: Record<Role, number>): number {
  return (
    getRemainingSlotsForRole(manager, 'P', req) +
    getRemainingSlotsForRole(manager, 'D', req) +
    getRemainingSlotsForRole(manager, 'C', req) +
    getRemainingSlotsForRole(manager, 'A', req)
  );
}

export function getMaxBid(manager: Manager, req: Record<Role, number>): number {
  const remainingSlots = getTotalRemainingSlots(manager, req);
  if (remainingSlots <= 0) return 0;
  // Each remaining slot after this one must have at least 1 credit reserved
  const reservedForOthers = Math.max(0, remainingSlots - 1);
  return Math.max(0, manager.budget - reservedForOthers);
}

export function getAverageBudgetPerRemainingSlot(manager: Manager, req: Record<Role, number>): number {
  const remainingSlots = getTotalRemainingSlots(manager, req);
  if (remainingSlots <= 0) return 0;
  return Math.round((manager.budget / remainingSlots) * 10) / 10;
}

// Recommended role budget percentages in standard fantacalcio
const DEFAULT_ROLE_WEIGHTS: Record<Role, number> = {
  P: 0.08, // 8%
  D: 0.15, // 15%
  C: 0.25, // 25%
  A: 0.52  // 52%
};

/**
 * Converts a raw PMA / PFC value (which in FantaCulo listone is calibrated on 500 FM standard budget)
 * into whole integer FM credits scaled to the auction totalBudget.
 */
export function getCreditsFromPMA(rawPrice: number, totalBudget: number): number {
  if (!rawPrice || rawPrice <= 0) return 1;
  const scale = (totalBudget || 500) / 500;
  const credits = Math.round(rawPrice * scale);
  return Math.max(1, credits);
}

/**
 * Formats a range string (e.g. "1-1" or "7-10" or "68-75") into scaled integer FM credits
 */
export function formatRangeInCredits(rangeStr: string | undefined, totalBudget: number): string {
  if (!rangeStr || !rangeStr.includes('-')) return '1-1 FM';
  const parts = rangeStr.split('-').map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const scale = (totalBudget || 500) / 500;
    const minCr = Math.max(1, Math.round(parts[0] * scale));
    const maxCr = Math.max(minCr, Math.round(parts[1] * scale));
    return `${minCr} - ${maxCr} FM`;
  }
  return rangeStr;
}

/**
 * Calculates a dynamic suggested target price for the user
 */
export function calculateTargetPrice(
  player: Player,
  user: Manager,
  settings: AuctionSettings
): { targetPrice: number; maxBidPossible: number; advice: string; statusColor: string } {
  const maxBidPossible = getMaxBid(user, settings.rosterRequirements);
  const remainingRoleSlots = getRemainingSlotsForRole(user, player.role, settings.rosterRequirements);

  if (remainingRoleSlots === 0) {
    return {
      targetPrice: 0,
      maxBidPossible,
      advice: `Slot ${player.role} già completati (${settings.rosterRequirements[player.role]}/${settings.rosterRequirements[player.role]})`,
      statusColor: 'text-rose-400'
    };
  }

  // Baseline reference from PMA / PFC in real integer credits
  const pmaCr = getCreditsFromPMA(player.pma, settings.totalBudget);
  const pfcCr = getCreditsFromPMA(player.pfc, settings.totalBudget);
  const basePrice = Math.max(1, pfcCr > 1 ? pfcCr : pmaCr);

  // Remaining budget factor
  const totalRemaining = getTotalRemainingSlots(user, settings.rosterRequirements);
  const avgSlotBudget = user.budget / Math.max(1, totalRemaining);

  let target = basePrice;

  // If player is top slot (1 or 2) in Attack or Midfield, allow higher allocation
  if (player.slot <= 2 && (player.role === 'A' || player.role === 'C')) {
    target = Math.min(maxBidPossible, Math.max(1, Math.round(basePrice * 1.05)));
  } else if (player.slot >= 6) {
    // Low cost / filler slot - advise keeping it low
    target = Math.min(Math.max(1, Math.round(avgSlotBudget * 0.4)), basePrice);
  }

  // Cap target at maxBidPossible
  target = Math.min(target, maxBidPossible);

  let advice = '';
  let statusColor = 'text-emerald-400';

  if (target >= maxBidPossible && maxBidPossible > 1) {
    advice = `All-in possibile: puoi offrire fino a ${maxBidPossible} FM`;
    statusColor = 'text-amber-400';
  } else if (player.slot === 1) {
    advice = `Top di reparto (${player.role}): Consigliato fino a ${target} FM (${Math.round((target / settings.totalBudget) * 100)}% budget)`;
    statusColor = 'text-emerald-400';
  } else if (player.slot <= 3) {
    advice = `Titolare solido (${player.slot}° slot): Target max ${target} FM`;
    statusColor = 'text-cyan-400';
  } else {
    advice = `Copertura/Scommessa (${player.slot}° slot): Consigliato non superare ${target} FM`;
    statusColor = 'text-purple-300';
  }

  return {
    targetPrice: Math.max(1, target),
    maxBidPossible,
    advice,
    statusColor
  };
}

export function getRoleColor(role: Role) {
  switch (role) {
    case 'P':
      return {
        bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        badge: 'bg-amber-500 text-black',
        text: 'text-amber-400',
        border: 'border-amber-500/50',
        accent: '#f59e0b'
      };
    case 'D':
      return {
        bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        badge: 'bg-emerald-500 text-black',
        text: 'text-emerald-400',
        border: 'border-emerald-500/50',
        accent: '#10b981'
      };
    case 'C':
      return {
        bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        badge: 'bg-blue-500 text-white',
        text: 'text-blue-400',
        border: 'border-blue-500/50',
        accent: '#3b82f6'
      };
    case 'A':
      return {
        bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
        badge: 'bg-rose-500 text-white',
        text: 'text-rose-400',
        border: 'border-rose-500/50',
        accent: '#f43f5e'
      };
  }
}

export function getTitolaritaColor(titolarita: number) {
  if (titolarita >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
  if (titolarita >= 50) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
  return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
}
