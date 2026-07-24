import { SalesDeal, DealStage } from '@ralion/database';

export type { DealStage };

export const DEAL_STAGE_PROBABILITIES: Record<DealStage, number> = {
  LEAD: 10,
  CONTACTED: 25,
  QUALIFIED: 45,
  PROPOSAL: 70,
  NEGOTIATION: 85,
  WON: 100,
  LOST: 0
};

export function calculateWeightedPipeline(deals: SalesDeal[]): {
  totalValue: number;
  weightedValue: number;
  byStage: Record<DealStage, { count: number; value: number }>;
} {
  let totalValue = 0;
  let weightedValue = 0;

  const byStage: Record<DealStage, { count: number; value: number }> = {
    LEAD: { count: 0, value: 0 },
    CONTACTED: { count: 0, value: 0 },
    QUALIFIED: { count: 0, value: 0 },
    PROPOSAL: { count: 0, value: 0 },
    NEGOTIATION: { count: 0, value: 0 },
    WON: { count: 0, value: 0 },
    LOST: { count: 0, value: 0 }
  };

  deals.forEach(deal => {
    totalValue += deal.value;
    const probability = deal.probability ?? DEAL_STAGE_PROBABILITIES[deal.stage] ?? 0;
    weightedValue += (deal.value * probability) / 100;

    if (byStage[deal.stage]) {
      byStage[deal.stage].count += 1;
      byStage[deal.stage].value += deal.value;
    }
  });

  return { totalValue, weightedValue, byStage };
}
