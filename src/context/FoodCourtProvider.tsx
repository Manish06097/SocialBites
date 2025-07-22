"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { FoodCourt } from '@/lib/types';

interface FoodCourtContextType {
  foodCourts: FoodCourt[];
  setFoodCourts: (courts: FoodCourt[]) => void;
  selectedFoodCourt: FoodCourt | null;
  setSelectedFoodCourt: (court: FoodCourt | null) => void;
}

const FoodCourtContext = createContext<FoodCourtContextType | undefined>(undefined);

export const FoodCourtProvider = ({ children }: { children: ReactNode }) => {
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [selectedFoodCourt, setSelectedFoodCourt] = useState<FoodCourt | null>(null);

  const handleSetSelectedFoodCourt = useCallback((court: FoodCourt | null) => {
    setSelectedFoodCourt(court);
  }, []);

  const handleSetFoodCourts = useCallback((courts: FoodCourt[]) => {
    setFoodCourts(courts);
  }, []);

  return (
    <FoodCourtContext.Provider value={{ foodCourts, setFoodCourts: handleSetFoodCourts, selectedFoodCourt, setSelectedFoodCourt: handleSetSelectedFoodCourt }}>
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
