"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { FoodCourt } from '@/lib/types';

interface FoodCourtContextType {
  foodCourts: FoodCourt[];
  setFoodCourts: (courts: FoodCourt[]) => void;
  selectedFoodCourt: FoodCourt | null;
  setSelectedFoodCourt: (court: FoodCourt | null) => void;
}

const FoodCourtContext = createContext<FoodCourtContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'selectedFoodCourt';

export const FoodCourtProvider = ({ children }: { children: ReactNode }) => {
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [selectedFoodCourt, setSelectedFoodCourt] = useState<FoodCourt | null>(null); // Initialize to null

  // Effect to load from localStorage on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFoodCourt = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFoodCourt) {
        setSelectedFoodCourt(JSON.parse(storedFoodCourt));
      }
    }
  }, []); // Run once on mount

  const handleSetSelectedFoodCourt = useCallback((court: FoodCourt | null) => {
    setSelectedFoodCourt(court);
    if (typeof window !== 'undefined') {
      if (court) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(court));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
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
