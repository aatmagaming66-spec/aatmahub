/**
 * Global Membership Configuration
 * Optimized for the 10-tier MLBB hierarchy with a 1 Lakh cap.
 * Warrior -> Elite -> Master -> Grandmaster -> Epic -> Legend -> Mythic -> Honor -> Glory -> Immortal
 * Discount Engine: 0.5% to 7% starting from Master.
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
  benefits: string[];
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
    benefits: ['Basic Store Access'],
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
    threshold: 500, 
    discount: 0, 
    color: '#10b981', 
    benefits: ['Priority Processing'],
    detailedBenefits: {
      discount: '0%',
      cashback: '0.5%',
      priority: 'Basic',
      promotions: 'Elite Only',
      limitBonus: '1%',
      accessLevel: 'Elite'
    },
    sortOrder: 1
  },
  { 
    id: 'master',
    name: 'Master', 
    threshold: 1000, 
    discount: 0.5, 
    color: '#3b82f6', 
    benefits: ['Faster Queue'],
    detailedBenefits: {
      discount: '0.5%',
      cashback: '1%',
      priority: 'Standard',
      promotions: 'Master Perks',
      limitBonus: '2%',
      accessLevel: 'Master'
    },
    sortOrder: 2
  },
  { 
    id: 'grandmaster',
    name: 'Grandmaster', 
    threshold: 2500, 
    discount: 1, 
    color: '#a855f7', 
    benefits: ['Premium Profile Badge'],
    detailedBenefits: {
      discount: '1%',
      cashback: '1.5%',
      priority: 'High',
      promotions: 'GM Events',
      limitBonus: '3%',
      accessLevel: 'Grandmaster'
    },
    sortOrder: 3
  },
  { 
    id: 'epic',
    name: 'Epic', 
    threshold: 5000, 
    discount: 2, 
    color: '#ec4899', 
    benefits: ['Priority Support'],
    detailedBenefits: {
      discount: '2%',
      cashback: '2.5%',
      priority: 'Premium',
      promotions: 'Epic Deals',
      limitBonus: '5%',
      accessLevel: 'Epic'
    },
    sortOrder: 4
  },
  { 
    id: 'legend',
    name: 'Legend', 
    threshold: 10000, 
    discount: 3, 
    color: '#eab308', 
    benefits: ['Exclusive Community Perks'],
    detailedBenefits: {
      discount: '3%',
      cashback: '4%',
      priority: 'Ultra',
      promotions: 'Legendary',
      limitBonus: '8%',
      accessLevel: 'Legend'
    },
    sortOrder: 5
  },
  { 
    id: 'mythic',
    name: 'Mythic', 
    threshold: 25000, 
    discount: 4, 
    color: '#ef4444', 
    benefits: ['Highest Priority'],
    detailedBenefits: {
      discount: '4%',
      cashback: '6%',
      priority: 'Critical',
      promotions: 'Mythic Drop',
      limitBonus: '15%',
      accessLevel: 'Mythic'
    },
    sortOrder: 6
  },
  { 
    id: 'mythic_honor',
    name: 'Mythic Honor', 
    threshold: 50000, 
    discount: 5, 
    color: '#f97316', 
    benefits: ['Advanced Rewards'],
    detailedBenefits: {
      discount: '5%',
      cashback: '8%',
      priority: 'Honorary',
      promotions: 'Limited Ed.',
      limitBonus: '20%',
      accessLevel: 'Honor'
    },
    sortOrder: 7
  },
  { 
    id: 'mythic_glory',
    name: 'Mythic Glory', 
    threshold: 75000, 
    discount: 6, 
    color: '#dc2626', 
    benefits: ['VVIP Concierge'],
    detailedBenefits: {
      discount: '6%',
      cashback: '10%',
      priority: 'Immediate',
      promotions: 'Glory Perks',
      limitBonus: '25%',
      accessLevel: 'Glory'
    },
    sortOrder: 8
  },
  { 
    id: 'mythic_immortal',
    name: 'Mythic Immortal', 
    threshold: 100000, 
    discount: 7, 
    color: '#fbbf24', 
    benefits: ['Platform Legend Status'],
    detailedBenefits: {
      discount: '7%',
      cashback: '15%',
      priority: 'Legendary',
      promotions: 'Unlimited',
      limitBonus: '50%',
      accessLevel: 'Immortal'
    },
    sortOrder: 9
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
