import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ViewMode, FocusTarget } from '../types';

interface StoreContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  focusTarget: FocusTarget | null;
  setFocusTarget: (target: FocusTarget | null) => void;
  focusedItemName: string | null;
  setFocusedItemName: (name: string | null) => void;
  lookOffset: number;
  setLookOffset: (offset: number) => void;
}

// Export the context object itself for bridging
export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WALL);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const [focusedItemName, setFocusedItemName] = useState<string | null>(null);
  const [lookOffset, setLookOffset] = useState<number>(0);

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        focusTarget,
        setFocusTarget,
        focusedItemName,
        setFocusedItemName,
        lookOffset,
        setLookOffset,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};