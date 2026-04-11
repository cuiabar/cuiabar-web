import { useEffect } from 'react';
import { applySeo, type SeoConfig } from '../lib/seo';

export const useSeo = (config: SeoConfig) => {
  useEffect(() => {
    applySeo(config);
  }, [config]);
};
