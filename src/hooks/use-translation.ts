
'use client';

import { useLanguage } from '@/components/providers/language-provider';
import en from '@/locales/en.json';
import kn from '@/locales/kn.json';

const translations = {
  en,
  kn,
};

// Function to get a nested property from an object using a dot-separated string
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};


export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const langFile = translations[language];
    const translation = getNestedTranslation(langFile, key);
    return translation || key; // Return the key itself if translation is not found
  };

  return { t, language };
};
