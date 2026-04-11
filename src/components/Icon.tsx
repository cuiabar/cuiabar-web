import type { ReactNode } from 'react';

type IconProps = {
  children: ReactNode;
};

export const Icon = ({ children }: IconProps) => (
  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cocoa text-xl text-white">{children}</span>
);
