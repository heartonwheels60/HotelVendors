export type DayType = 'weekday' | 'weekend' | 'special';

export interface SeasonalPricing {
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  name: string;       // e.g., "Summer Season", "Winter Season"
  multiplier: number; // e.g., 1.2 for 20% increase
}

export interface DynamicPricing {
  basePrice: number;
  weekendMultiplier: number;  // e.g., 1.3 for 30% increase
  specialDays: SpecialDay[];
  seasonalPricing: SeasonalPricing[];
}

export interface SpecialDay {
  date: string;        // ISO date string
  name: string;        // e.g., "New Year's Eve"
  multiplier: number;  // e.g., 2.0 for double price
  recurring?: boolean; // If true, applies every year on same date
}

export interface PriceCalculationResult {
  finalPrice: number;
  basePrice: number;
  appliedMultipliers: {
    type: 'weekend' | 'special' | 'seasonal';
    name: string;
    multiplier: number;
  }[];
}
