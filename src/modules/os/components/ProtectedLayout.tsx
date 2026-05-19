import type { ReactNode } from 'react';

type ProtectedLayoutProps = {
  children: ReactNode;
};

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  // TODO: substituir por autenticacao interna GHCO OS antes de divulgar acesso para equipe ampla.
  return <>{children}</>;
};
