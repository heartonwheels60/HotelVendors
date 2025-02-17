import React, { useEffect, useState } from 'react';
import { differenceInDays } from 'date-fns';
import { calculateDynamicPrice, findSpecialDay } from '../../utils/pricingUtils';
import { useDynamicPricing } from '../../contexts/DynamicPricingContext';
import type { DynamicPricing } from '../../types/pricing';

interface DynamicPriceCalculatorProps {
  checkIn: Date;
  checkOut: Date;
  dynamicPricing?: {
    roomOnly: DynamicPricing;
    breakfastIncluded?: DynamicPricing;
    halfBoard?: DynamicPricing;
    fullBoard?: DynamicPricing;
  };
  selectedBoardType: 'room-only' | 'breakfast-included' | 'half-board' | 'full-board';
  onPriceCalculated: (totalPrice: number) => void;
  propertyId: string;
}

export const DynamicPriceCalculator: React.FC<DynamicPriceCalculatorProps> = ({
  checkIn,
  checkOut,
  dynamicPricing,
  selectedBoardType,
  onPriceCalculated,
  propertyId,
}) => {
  const { deleteSpecialDayPrice } = useDynamicPricing();
  const [breakdown, setBreakdown] = useState<{
    dailyPrices: { date: Date; price: number; multipliers: string[]; isSpecialDay: boolean }[];
    total: number;
  }>({ dailyPrices: [], total: 0 });

  useEffect(() => {
    if (!dynamicPricing) {
      return;
    }

    const pricing = {
      'room-only': dynamicPricing.roomOnly,
      'breakfast-included': dynamicPricing.breakfastIncluded,
      'half-board': dynamicPricing.halfBoard,
      'full-board': dynamicPricing.fullBoard,
    }[selectedBoardType];

    if (!pricing) {
      return;
    }

    const days = differenceInDays(checkOut, checkIn);
    let totalPrice = 0;
    const dailyPrices = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(checkIn);
      currentDate.setDate(currentDate.getDate() + i);

      const priceCalculation = calculateDynamicPrice(currentDate, pricing);
      totalPrice += priceCalculation.finalPrice;

      const isSpecialDay = findSpecialDay(currentDate, pricing.specialDays) !== undefined;

      dailyPrices.push({
        date: currentDate,
        price: priceCalculation.finalPrice,
        multipliers: priceCalculation.appliedMultipliers.map(
          (m) => `${m.name} (${((m.multiplier - 1) * 100).toFixed(0)}% ${m.multiplier > 1 ? 'increase' : 'decrease'})`
        ),
        isSpecialDay
      });
    }

    setBreakdown({ dailyPrices, total: totalPrice });
    onPriceCalculated(totalPrice);
  }, [checkIn, checkOut, dynamicPricing, selectedBoardType]);

  const handleDeleteSpecialDay = async (date: Date) => {
    try {
      const dateString = date.toISOString().split('T')[0];
      await deleteSpecialDayPrice(propertyId, dateString);
    } catch (error) {
      console.error('Error deleting special day price:', error);
    }
  };

  if (!dynamicPricing) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg font-medium">Price Breakdown</h3>
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        {breakdown.dailyPrices.map((day, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div>
              <div className="font-medium">
                {day.date.toLocaleDateString()} - ${day.price}
              </div>
              {day.multipliers.length > 0 && (
                <div className="text-gray-600 text-xs">
                  Applied: {day.multipliers.join(', ')}
                </div>
              )}
            </div>
            {day.isSpecialDay && (
              <button
                onClick={() => handleDeleteSpecialDay(day.date)}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Remove Special Price
              </button>
            )}
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${breakdown.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
