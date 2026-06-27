/**
 * Membership system decommissioned.
 * Stub maintained for backward compatibility with existing data structures.
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
    id: 'verified',
    name: 'Verified User', 
    threshold: 0, 
    discount: 0, 
    color: '#94a3b8', 
    benefits: ['Store Access'],
    detailedBenefits: {
      discount: '0%',
      cashback: '0%',
      priority: 'Standard',
      promotions: 'Basic',
      limitBonus: '0%',
      accessLevel: 'Verified'
    },
    sortOrder: 0
  }
];

export function getRankFromSpend(spend: number, ranks: RankDefinition[] = DEFAULT_RANKS) {
  return DEFAULT_RANKS[0];
}

export function getNextRank(spend: number, ranks: RankDefinition[] = DEFAULT_RANKS) {
  return null;
}