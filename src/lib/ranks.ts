/**
 * Global Rank Configuration & Thresholds
 * Optimized for the Advanced Swipeable Progression Center
 */

export interface RankBenefits {
  discount: string;
  cashback: string;
  priority: string;
  promotions: string;
  limitBonus: string;
  accessLevel: string;
}

export interface RankDefinition {
  id: string;
  name: string;
  threshold: number;
  discount: number;
  color: string;
  benefits: string[]; // Key benefits list
  detailedBenefits: RankBenefits;
  sortOrder: number;
}

export const DEFAULT_RANKS: RankDefinition[] = [
  { 
    id: 'warrior',
    name: 'Warrior', 
    threshold: 0, 
    discount: 0, 
    color: '#94a3b8', 
    benefits: ['Basic HUB Access'],
    detailedBenefits: {
      discount: '0%',
      cashback: '0%',
      priority: 'No',
      promotions: 'Basic',
      limitBonus: '0%',
      accessLevel: 'Basic'
    },
    sortOrder: 0
  },
  { 
    id: 'elite',
    name: 'Elite', 
    threshold: 1000, 
    discount: 1, 
    color: '#10b981', 
    benefits: ['Priority Order Processing'],
    detailedBenefits: {
      discount: '1%',
      cashback: '0.5%',
      priority: 'Basic',
      promotions: 'Elite',
      limitBonus: '1%',
      accessLevel: 'Elite'
    },
    sortOrder: 1
  },
  { 
    id: 'master',
    name: 'Master', 
    threshold: 5000, 
    discount: 2, 
    color: '#3b82f6', 
    benefits: ['Faster Order Queue'],
    detailedBenefits: {
      discount: '2%',
      cashback: '1%',
      priority: 'Standard',
      promotions: 'Master',
      limitBonus: '2%',
      accessLevel: 'Master'
    },
    sortOrder: 2
  },
  { 
    id: 'epic',
    name: 'Epic', 
    threshold: 10000, 
    discount: 3, 
    color: '#a855f7', 
    benefits: ['Premium Profile Badge'],
    detailedBenefits: {
      discount: '3%',
      cashback: '1.5%',
      priority: 'High',
      promotions: 'Epic',
      limitBonus: '3%',
      accessLevel: 'Epic'
    },
    sortOrder: 3
  },
  { 
    id: 'legend',
    name: 'Legend', 
    threshold: 50000, 
    discount: 5, 
    color: '#eab308', 
    benefits: ['Priority Customer Support'],
    detailedBenefits: {
      discount: '5%',
      cashback: '2.5%',
      priority: 'Premium',
      promotions: 'Legend',
      limitBonus: '5%',
      accessLevel: 'Legend'
    },
    sortOrder: 4
  },
  { 
    id: 'mythic',
    name: 'Mythic', 
    threshold: 100000, 
    discount: 7, 
    color: '#ef4444', 
    benefits: ['Exclusive Community Perks'],
    detailedBenefits: {
      discount: '7%',
      cashback: '4%',
      priority: 'Ultra',
      promotions: 'Mythic',
      limitBonus: '8%',
      accessLevel: 'Mythic'
    },
    sortOrder: 5
  },
  { 
    id: 'immortal',
    name: 'Immortal', 
    threshold: 500000, 
    discount: 10, 
    color: '#fbbf24', 
    benefits: ['Highest Order Priority'],
    detailedBenefits: {
      discount: '10%',
      cashback: '6%',
      priority: 'Critical',
      promotions: 'Immortal',
      limitBonus: '15%',
      accessLevel: 'Immortal'
    },
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
