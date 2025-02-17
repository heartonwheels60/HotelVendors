import { DynamicPricing, PriceCalculationResult, SpecialDay, SeasonalPricing } from '../types/pricing';

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const findSpecialDay = (date: Date, specialDays: SpecialDay[]): SpecialDay | undefined => {
  const dateString = date.toISOString().split('T')[0];
  
  return specialDays.find(special => {
    if (special.recurring) {
      // For recurring events, only compare month and day
      const specialDate = new Date(special.date);
      const currentDate = new Date(date);
      return specialDate.getMonth() === currentDate.getMonth() && 
             specialDate.getDate() === currentDate.getDate();
    }
    return special.date === dateString;
  });
};

export const findActiveSeason = (date: Date, seasonalPricing: SeasonalPricing[]): SeasonalPricing | undefined => {
  const dateString = date.toISOString().split('T')[0];
  
  return seasonalPricing.find(season => 
    dateString >= season.startDate && dateString <= season.endDate
  );
};

export const calculateDynamicPrice = (
  date: Date,
  dynamicPricing: DynamicPricing
): PriceCalculationResult => {
  let finalPrice = dynamicPricing.basePrice;
  const appliedMultipliers = [];

  // Check for seasonal pricing
  const activeSeason = findActiveSeason(date, dynamicPricing.seasonalPricing);
  if (activeSeason) {
    finalPrice *= activeSeason.multiplier;
    appliedMultipliers.push({
      type: 'seasonal' as const,
      name: activeSeason.name,
      multiplier: activeSeason.multiplier
    });
  }

  // Check for special days
  const specialDay = findSpecialDay(date, dynamicPricing.specialDays);
  if (specialDay) {
    finalPrice *= specialDay.multiplier;
    appliedMultipliers.push({
      type: 'special' as const,
      name: specialDay.name,
      multiplier: specialDay.multiplier
    });
  } else if (isWeekend(date)) {
    // Apply weekend pricing only if it's not a special day
    finalPrice *= dynamicPricing.weekendMultiplier;
    appliedMultipliers.push({
      type: 'weekend' as const,
      name: 'Weekend Rate',
      multiplier: dynamicPricing.weekendMultiplier
    });
  }

  return {
    finalPrice: Math.round(finalPrice), // Round to nearest whole number
    basePrice: dynamicPricing.basePrice,
    appliedMultipliers
  };
};
