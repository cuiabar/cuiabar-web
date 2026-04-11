import { createContext, useContext } from 'react';
import type { BootstrapStatus, SessionPayload, SessionUser } from './types';

export interface CrmContextValue {
  session: SessionPayload | null;
  bootstrap: BootstrapStatus | null;
  csrfToken: string | null;
  user: SessionUser | null;
  refreshSession: () => Promise<void>;
}

export const CrmContext = createContext<CrmContextValue | null>(null);

export const useCrm = () => {
  const value = useContext(CrmContext);
  if (!value) {
    throw new Error('useCrm precisa ser usado dentro do CrmContext.');
  }
  return value;
};
