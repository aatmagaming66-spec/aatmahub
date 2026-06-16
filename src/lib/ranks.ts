/**
 * Global Rank Configuration & Thresholds
 * Optimized for the Advanced Swipeable Progression Center
 */

export interface RankDefinition {
  id: string;
  name: string;
  threshold: number;
  discount: number;
  color: string;
  benefits: string[];
  sortOrder: number;
}

export const DEFAULT_RANKS: RankDefinition[] = [
  { 
    id: 'warrior',
    name: 'Warrior', 
    threshold: 0, 
    discount: 0, 
    color: '#94a3b8', 
    benefits: ['0% Purchase Discount', 'Basic HUB Access'],
    sortOrder: 0
  },
  { 
    id: 'elite',
    name: 'Elite', 
    threshold: 1000, 
    discount: 1, 
    color: '#10b981', 
    benefits: ['1% Purchase Discount', 'Priority Order Processing'],
    sortOrder: 1
  },
  { 
    id: 'master',
    name: 'Master', 
    threshold: 5000, 
    discount: 2, 
    color: '#3b82f6', 
    benefits: ['2% Purchase Discount', 'Faster Order Queue'],
    sortOrder: 2
  },
  { 
    id: 'epic',
    name: 'Epic', 
    threshold: 10000, 
    discount: 3, 
    color: '#a855f7', 
    benefits: ['3% Purchase Discount', 'Premium Profile Badge'],
    sortOrder: 3
  },
  { 
    id: 'legend',
    name: 'Legend', 
    threshold: 50000, 
    discount: 5, 
    color: '#eab308', 
    benefits: ['5% Purchase Discount', 'Priority Customer Support'],
    sortOrder: 4
  },
  { 
    id: 'mythic',
    name: 'Mythic', 
    threshold: 100000, 
    discount: 7, 
    color: '#ef4444', 
    benefits: ['7% Purchase Discount', 'Exclusive Community Perks'],
    sortOrder: 5
  },
  { 
    id: 'immortal',
    name: 'Immortal', 
    threshold: 500000, 
    discount: 10, 
    color: '#fbbf24', 
    benefits: ['10% Purchase Discount', 'Highest Order Priority', 'Exclusive Immortal Benefits'],
    sortOrder: 6
  },
];

export function getRankFromSpend(spend: number, ranks: RankDefinition[] = DEFAULT_RANKS) {
  const sorted = [...ranks].sort((a, b) => b.threshold - a.threshold);
  for (const rank of sorted) {
    if (spend >= rank.threshold) {
      return rank;
    }
  }
  return ranks[0];
}

export function getNextRank(spend: number, ranks: RankDefinition[] = DEFAULT_RANKS) {
  const currentRank = getRankFromSpend(spend, ranks);
  const sorted = [...ranks].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentIndex = sorted.findIndex(r => r.id === currentRank.id);
  return currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
}
