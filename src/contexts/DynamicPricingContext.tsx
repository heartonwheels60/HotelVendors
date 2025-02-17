import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DynamicPricing, SpecialDay } from '../types/pricing';
import { propertyService } from '../services/propertyService';

interface DynamicPricingContextType {
  dynamicPricing: {
    roomOnly: DynamicPricing;
    breakfastIncluded?: DynamicPricing;
    halfBoard?: DynamicPricing;
    fullBoard?: DynamicPricing;
  } | null;
  updateBasePrice: (propertyId: string, roomType: string, basePrice: number) => Promise<void>;
  loadDynamicPricing: (propertyId: string) => Promise<void>;
  deleteSpecialDayPrice: (propertyId: string, date: string) => Promise<void>;
}

const DynamicPricingContext = createContext<DynamicPricingContextType | undefined>(undefined);

export const DynamicPricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dynamicPricing, setDynamicPricing] = useState<DynamicPricingContextType['dynamicPricing']>(null);

  const loadDynamicPricing = useCallback(async (propertyId: string) => {
    try {
      const pricing = await propertyService.getPropertyDynamicPricing(propertyId);
      setDynamicPricing(pricing);
    } catch (error) {
      console.error('Error loading dynamic pricing:', error);
      throw error;
    }
  }, []);

  const updateBasePrice = useCallback(async (propertyId: string, roomType: string, basePrice: number) => {
    if (!dynamicPricing) return;

    const updatedPricing = {
      ...dynamicPricing,
      roomOnly: {
        ...dynamicPricing.roomOnly,
        basePrice
      },
      breakfastIncluded: dynamicPricing.breakfastIncluded ? {
        ...dynamicPricing.breakfastIncluded,
        basePrice: basePrice * 1.2
      } : undefined,
      halfBoard: dynamicPricing.halfBoard ? {
        ...dynamicPricing.halfBoard,
        basePrice: basePrice * 1.4
      } : undefined,
      fullBoard: dynamicPricing.fullBoard ? {
        ...dynamicPricing.fullBoard,
        basePrice: basePrice * 1.6
      } : undefined
    };

    try {
      await propertyService.updatePropertyDynamicPricing(propertyId, updatedPricing);
      setDynamicPricing(updatedPricing);
    } catch (error) {
      console.error('Error updating dynamic pricing:', error);
      throw error;
    }
  }, [dynamicPricing]);

  const deleteSpecialDayPrice = useCallback(async (propertyId: string, date: string) => {
    if (!dynamicPricing) return;

    // Create updated pricing by removing the special day from all board types
    const updatedPricing = {
      ...dynamicPricing,
      roomOnly: {
        ...dynamicPricing.roomOnly,
        specialDays: dynamicPricing.roomOnly.specialDays.filter(day => day.date !== date)
      },
      breakfastIncluded: dynamicPricing.breakfastIncluded ? {
        ...dynamicPricing.breakfastIncluded,
        specialDays: dynamicPricing.breakfastIncluded.specialDays.filter(day => day.date !== date)
      } : undefined,
      halfBoard: dynamicPricing.halfBoard ? {
        ...dynamicPricing.halfBoard,
        specialDays: dynamicPricing.halfBoard.specialDays.filter(day => day.date !== date)
      } : undefined,
      fullBoard: dynamicPricing.fullBoard ? {
        ...dynamicPricing.fullBoard,
        specialDays: dynamicPricing.fullBoard.specialDays.filter(day => day.date !== date)
      } : undefined
    };

    try {
      await propertyService.updatePropertyDynamicPricing(propertyId, updatedPricing);
      setDynamicPricing(updatedPricing);
    } catch (error) {
      console.error('Error deleting special day price:', error);
      throw error;
    }
  }, [dynamicPricing]);

  return (
    <DynamicPricingContext.Provider value={{ 
      dynamicPricing, 
      updateBasePrice, 
      loadDynamicPricing,
      deleteSpecialDayPrice 
    }}>
      {children}
    </DynamicPricingContext.Provider>
  );
};

export const useDynamicPricing = () => {
  const context = useContext(DynamicPricingContext);
  if (context === undefined) {
    throw new Error('useDynamicPricing must be used within a DynamicPricingProvider');
  }
  return context;
};
