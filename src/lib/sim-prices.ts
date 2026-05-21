/** HYROX 시뮬 드랍인 비용 (싱글 / 더블 / 릴레이) — 제보로 채움 */
export const SIM_DIVISIONS = ["single", "double", "relay"] as const;
export type SimDivision = (typeof SIM_DIVISIONS)[number];

export const SIM_DIVISION_LABELS: Record<SimDivision, string> = {
  single: "싱글",
  double: "더블",
  relay: "릴레이",
};

export type SimPrices = {
  single: string | null;
  double: string | null;
  relay: string | null;
};

export type SimPriceFields = {
  simPriceSingle: string | null;
  simPriceDouble: string | null;
  simPriceRelay: string | null;
};

export function simPricesFromFields(fields: SimPriceFields): SimPrices {
  return {
    single: fields.simPriceSingle,
    double: fields.simPriceDouble,
    relay: fields.simPriceRelay,
  };
}

export function hasAnySimPrice(prices: SimPrices): boolean {
  return Boolean(prices.single || prices.double || prices.relay);
}

export function countSimPrices(prices: SimPrices): number {
  return SIM_DIVISIONS.filter((d) => prices[d]).length;
}
