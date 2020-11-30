import React from 'react';

export function createContext<T extends {} | null>() {
  const context = React.createContext<T | undefined>(undefined);

  const useContext = () => {
    const c = React.useContext(context);
    if (c === undefined) {
      throw new Error('useContext must be used inside Exupery Provider with defined value.');
    }
    return c;
  };

  return {
    Provider: context.Provider,
    useContext,
  };
}
