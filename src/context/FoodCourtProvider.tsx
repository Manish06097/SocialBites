"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { foodCourts } from '@/lib/data';
import type { FoodCourt } from '@/lib/types';

interface FoodCourtContextType {
  foodCourts: FoodCourt[];
  selectedFoodCourt: FoodCourt;
  setSelectedFoodCourt: (court: FoodCourt) => void;
}

const FoodCourtContext = createContext<FoodCourtContextType | undefined>(undefined);

export const FoodCourtProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFoodCourt, setSelectedFoodCourt] = useState<FoodCourt>(foodCourts[0]);

  const handleSetSelectedFoodCourt = useCallback((court: FoodCourt) => {
    setSelectedFoodCourt(court);
  }, []);

  return (
    <FoodCourtContext.Provider value={{ foodCourts, selectedFoodCourt, setSelectedFoodCourt: handleSetSelectedFoodCourt }}>
      {children}
    </FoodCourtContext.Provider>
  );
};

export const useFoodCourt = () => {
  const context = useContext(FoodCourtContext);
  if (context === undefined) {
    throw new Error('useFoodCourt must be used within a FoodCourtProvider');
  }
  return context;
};
