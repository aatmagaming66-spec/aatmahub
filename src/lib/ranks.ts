/**
 * Global Rank Configuration & Thresholds
 */

export const RANKS = [
  { name: 'Warrior', threshold: 0, discount: 0, color: '#94a3b8' },
  { name: 'Elite', threshold: 500, discount: 0, color: '#10b981' },
  { name: 'Master', threshold: 1500, discount: 0, color: '#3b82f6' },
  { name: 'Grandmaster', threshold: 3000, discount: 0, color: '#a855f7' },
  { name: 'Epic', threshold: 7500, discount: 0, color: '#ec4899' },
  { name: 'Legend', threshold: 15000, discount: 0, color: '#eab308' },
  { name: 'Mythic', threshold: 30000, discount: 0, color: '#ef4444' },
  { name: 'Mythical Honor', threshold: 50000, discount: 1, color: '#f97316' },
  { name: 'Mythical Glory', threshold: 75000, discount: 2, color: '#dc2626' },
  { name: 'Mythical Immortal', threshold: 100000, discount: 3, color: '#fbbf24' },
];

export function getRankFromSpend(spend: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (spend >= RANKS[i].threshold) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(spend: number) {
  const currentRank = getRankFromSpend(spend);
  const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);
  return currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;
}
