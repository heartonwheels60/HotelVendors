import React, { useState, useEffect } from 'react';
import { DynamicPricing, SeasonalPricing, SpecialDay } from '../../types/pricing';

interface DynamicPricingFormProps {
  initialData?: DynamicPricing;
  onChange: (pricing: DynamicPricing) => void;
  roomType: string;
}

const DEFAULT_MULTIPLIERS = {
  standard: {
    weekend: 1.2,
    special: 1.3,
    seasonal: 1.2
  },
  deluxe: {
    weekend: 1.3,
    special: 1.5,
    seasonal: 1.4
  },
  suite: {
    weekend: 1.4,
    special: 1.8,
    seasonal: 1.6
  },
  executive: {
    weekend: 1.5,
    special: 2.0,
    seasonal: 1.8
  }
};

export const DynamicPricingForm: React.FC<DynamicPricingFormProps> = ({
  initialData,
  onChange,
  roomType
}) => {
  const [pricing, setPricing] = useState<DynamicPricing>(
    initialData || {
      basePrice: 0,
      weekendMultiplier: DEFAULT_MULTIPLIERS[roomType as keyof typeof DEFAULT_MULTIPLIERS].weekend,
      specialDays: [],
      seasonalPricing: [],
    }
  );

  // Update multipliers when room type changes
  useEffect(() => {
    const defaultMultipliers = DEFAULT_MULTIPLIERS[roomType as keyof typeof DEFAULT_MULTIPLIERS];
    if (defaultMultipliers) {
      handleChange({
        weekendMultiplier: defaultMultipliers.weekend,
        specialDays: pricing.specialDays.map(day => ({
          ...day,
          multiplier: defaultMultipliers.special
        })),
        seasonalPricing: pricing.seasonalPricing.map(season => ({
          ...season,
          multiplier: defaultMultipliers.seasonal
        }))
      });
    }
  }, [roomType]);

  const handleChange = (updates: Partial<DynamicPricing>) => {
    const newPricing = { ...pricing, ...updates };
    setPricing(newPricing);
    onChange(newPricing);
  };

  const addSpecialDay = () => {
    const defaultMultipliers = DEFAULT_MULTIPLIERS[roomType as keyof typeof DEFAULT_MULTIPLIERS];
    const newSpecialDay: SpecialDay = {
      date: new Date().toISOString().split('T')[0],
      name: '',
      multiplier: defaultMultipliers.special,
      recurring: false,
    };
    handleChange({
      specialDays: [...pricing.specialDays, newSpecialDay],
    });
  };

  const addSeason = () => {
    const defaultMultipliers = DEFAULT_MULTIPLIERS[roomType as keyof typeof DEFAULT_MULTIPLIERS];
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const newSeason: SeasonalPricing = {
      startDate: today.toISOString().split('T')[0],
      endDate: threeMonthsLater.toISOString().split('T')[0],
      name: '',
      multiplier: defaultMultipliers.seasonal,
    };
    handleChange({
      seasonalPricing: [...pricing.seasonalPricing, newSeason],
    });
  };

  const removeSpecialDay = (index: number) => {
    const newDays = [...pricing.specialDays];
    newDays.splice(index, 1);
    handleChange({ specialDays: newDays });
  };

  const removeSeason = (index: number) => {
    const newSeasons = [...pricing.seasonalPricing];
    newSeasons.splice(index, 1);
    handleChange({ seasonalPricing: newSeasons });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Base Price</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            value={pricing.basePrice}
            onChange={(e) => handleChange({ basePrice: parseFloat(e.target.value) || 0 })}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Weekend Price Multiplier
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="number"
            step="0.1"
            value={pricing.weekendMultiplier}
            onChange={(e) => handleChange({ weekendMultiplier: parseFloat(e.target.value) || 1 })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-500">
            (Weekend price will be ${(pricing.basePrice * pricing.weekendMultiplier).toFixed(2)})
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Special Days</h3>
          <button
            type="button"
            onClick={addSpecialDay}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            Add Special Day
          </button>
        </div>
        {pricing.specialDays.map((day, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-center">
            <input
              type="date"
              value={day.date}
              onChange={(e) => {
                const newDays = [...pricing.specialDays];
                newDays[index] = { ...day, date: e.target.value };
                handleChange({ specialDays: newDays });
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              value={day.name}
              placeholder="Event name"
              onChange={(e) => {
                const newDays = [...pricing.specialDays];
                newDays[index] = { ...day, name: e.target.value };
                handleChange({ specialDays: newDays });
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                step="0.1"
                value={day.multiplier}
                onChange={(e) => {
                  const newDays = [...pricing.specialDays];
                  newDays[index] = {
                    ...day,
                    multiplier: parseFloat(e.target.value) || 1,
                  };
                  handleChange({ specialDays: newDays });
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  (${(pricing.basePrice * day.multiplier).toFixed(2)})
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={day.recurring || false}
                onChange={(e) => {
                  const newDays = [...pricing.specialDays];
                  newDays[index] = { ...day, recurring: e.target.checked };
                  handleChange({ specialDays: newDays });
                }}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-600">Recurring</label>
            </div>
            <button
              type="button"
              onClick={() => removeSpecialDay(index)}
              className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Seasonal Pricing</h3>
          <button
            type="button"
            onClick={addSeason}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            Add Season
          </button>
        </div>
        {pricing.seasonalPricing.map((season, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-center">
            <input
              type="date"
              value={season.startDate}
              onChange={(e) => {
                const newSeasons = [...pricing.seasonalPricing];
                newSeasons[index] = { ...season, startDate: e.target.value };
                handleChange({ seasonalPricing: newSeasons });
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="date"
              value={season.endDate}
              onChange={(e) => {
                const newSeasons = [...pricing.seasonalPricing];
                newSeasons[index] = { ...season, endDate: e.target.value };
                handleChange({ seasonalPricing: newSeasons });
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="text"
              value={season.name}
              placeholder="Season name"
              onChange={(e) => {
                const newSeasons = [...pricing.seasonalPricing];
                newSeasons[index] = { ...season, name: e.target.value };
                handleChange({ seasonalPricing: newSeasons });
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                step="0.1"
                value={season.multiplier}
                onChange={(e) => {
                  const newSeasons = [...pricing.seasonalPricing];
                  newSeasons[index] = {
                    ...season,
                    multiplier: parseFloat(e.target.value) || 1,
                  };
                  handleChange({ seasonalPricing: newSeasons });
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  (${(pricing.basePrice * season.multiplier).toFixed(2)})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeSeason(index)}
              className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
