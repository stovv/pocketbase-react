import React, { createContext, useMemo } from 'react';
import PocketBase from 'pocketbase';
import type { ClientProviderProps, PocketBaseContextType } from '../types';

export const ClientContext = createContext<PocketBaseContextType | null>(null);
export function ClientProvider({ children, serverURL }: ClientProviderProps) {
  const client = useMemo(() => new PocketBase(serverURL), [serverURL]);

  return <ClientContext.Provider value={{ client }}>{children}</ClientContext.Provider>;
}
