'use client';
import { SessionProvider } from 'next-auth/react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Lang, TEXT, T } from '@/lib/i18n';

type LangCtx = { lang: Lang; t: T; setLang: (l: Lang) => void };
export const LangContext = createContext<LangCtx>({ lang: 'he', t: TEXT.he, setLang: () => {} });
export const useLang = () => useContext(LangContext);

function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he');

  const setLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.setAttribute('lang', l);
    document.documentElement.setAttribute('dir', TEXT[l].dir);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', TEXT[lang].dir);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, t: TEXT[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LangProvider>{children}</LangProvider>
    </SessionProvider>
  );
}
