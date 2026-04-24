import React, { createContext, useContext, useState } from 'react';

// 1. Define available languages
type Language = 'EN' | 'TL';

// 2. Define what the "Engine" provides to other components
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (en: string, tl: string) => string; // Translation helper
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  // Switch between English and Tagalog
  const toggleLanguage = () => setLanguage((prev) => (prev === 'EN' ? 'TL' : 'EN'));

  // The helper function: if language is EN, return first text, else return second
  const t = (en: string, tl: string) => (language === 'EN' ? en : tl);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 3. Create a custom "hook" so components can easily grab the data
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};