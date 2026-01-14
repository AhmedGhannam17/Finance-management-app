import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { SmartFAB, SmartFABRef } from '../components/SmartFAB';

interface FABContextType {
  showFAB: () => void;
  hideFAB: () => void;
}

const FABContext = createContext<FABContextType | undefined>(undefined);

export const FABProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fabRef = useRef<SmartFABRef>(null);

  const showFAB = () => fabRef.current?.show();
  const hideFAB = () => fabRef.current?.hide();

  return (
    <FABContext.Provider value={{ showFAB, hideFAB }}>
      {children}
      <SmartFAB ref={fabRef} />
    </FABContext.Provider>
  );
};

export const useFAB = () => {
  const context = useContext(FABContext);
  if (!context) {
    throw new Error('useFAB must be used within a FABProvider');
  }
  return context;
};
