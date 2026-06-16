
/**
 * Global Rank Configuration & Thresholds
 * Optimized for the 8-tier hierarchy: Warrior -> Bronze -> Silver -> Gold -> Platinum -> Diamond -> Elite -> Legend
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
    id: 'bronze',
    name: 'Bronze', 
    threshold: 1000, 
    discount: 1, 
    color: '#cd7f32', 
    benefits: ['Priority Order Processing'],
    detailedBenefits: {
      discount: '1%',
      cashback: '0.5%',
      priority: 'Basic',
      promotions: 'Bronze',
      limitBonus: '1%',
      accessLevel: 'Bronze'
    },
    sortOrder: 1
  },
  { 
    id: 'silver',
    name: 'Silver', 
    threshold: 5000, 
    discount: 2, 
    color: '#c0c0c0', 
    benefits: ['Faster Order Queue'],
    detailedBenefits: {
      discount: '2%',
      cashback: '1%',
      priority: 'Standard',
      promotions: 'Silver',
      limitBonus: '2%',
      accessLevel: 'Silver'
    },
    sortOrder: 2
  },
  { 
    id: 'gold',
    name: 'Gold', 
    threshold: 10000, 
    discount: 3, 
    color: '#ffd700', 
    benefits: ['Premium Profile Badge'],
    detailedBenefits: {
      discount: '3%',
      cashback: '1.5%',
      priority: 'High',
      promotions: 'Gold',
      limitBonus: '3%',
      accessLevel: 'Gold'
    },
    sortOrder: 3
  },
  { 
    id: 'platinum',
    name: 'Platinum', 
    threshold: 25000, 
    discount: 5, 
    color: '#e5e4e2', 
    benefits: ['Priority Customer Support'],
    detailedBenefits: {
      discount: '5%',
      cashback: '2.5%',
      priority: 'Premium',
      promotions: 'Platinum',
      limitBonus: '5%',
      accessLevel: 'Platinum'
    },
    sortOrder: 4
  },
  { 
    id: 'diamond',
    name: 'Diamond', 
    threshold: 50000, 
    discount: 7, 
    color: '#b9f2ff', 
    benefits: ['Exclusive Community Perks'],
    detailedBenefits: {
      discount: '7%',
      cashback: '4%',
      priority: 'Ultra',
      promotions: 'Diamond',
      limitBonus: '8%',
      accessLevel: 'Diamond'
    },
    sortOrder: 5
  },
  { 
    id: 'elite',
    name: 'Elite', 
    threshold: 100000, 
    discount: 10, 
    color: '#dc2626', 
    benefits: ['Highest Order Priority'],
    detailedBenefits: {
      discount: '10%',
      cashback: '6%',
      priority: 'Critical',
      promotions: 'Elite',
      limitBonus: '15%',
      accessLevel: 'Elite'
    },
    sortOrder: 6
  },
  { 
    id: 'legend',
    name: 'Legend', 
    threshold: 500000, 
    discount: 15, 
    color: '#fbbf24', 
    benefits: ['Platform Legend Status'],
    detailedBenefits: {
      discount: '15%',
      cashback: '10%',
      priority: 'Legendary',
      promotions: 'Legend',
      limitBonus: '25%',
      accessLevel: 'Legend'
    },
    sortOrder: 7
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
