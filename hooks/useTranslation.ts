import { useConfigStore } from './useConfigStore';
import { translations } from '@/lib/i18n';

export const useTranslation = () => {
  const language = useConfigStore((state) => state.language);
  const raw = translations[language] || translations.ko;

  const t = (path: string, args?: Record<string, string | number>) => {
    const keys = path.split('.');
    let value: unknown = raw;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }

    if (typeof value !== 'string') return path;
    
    let result: string = value;
    if (args) {
      Object.entries(args).forEach(([key, val]) => {
        result = result.replaceAll(`{${key}}`, String(val));
      });
    }
    return result;
  };

  return { t, language, raw };
};
