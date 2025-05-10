import PocketBase from 'pocketbase';
import React, { createContext, useMemo } from 'react';
import { StorageService } from '../services/storage';
import type { ClientContextType, ClientProviderProps } from '../types';

export const ClientContext = createContext<ClientContextType | null>(null);
export function ClientProvider({ children, serverURL }: ClientProviderProps) {
  const client = useMemo(() => {
    const pocketbase = new PocketBase(serverURL);

    pocketbase.authStore.onChange(async () => {
      await StorageService.set(
        StorageService.Constants.COOKIE,
        pocketbase.authStore.exportToCookie(),
      );
    });

    StorageService.get(StorageService.Constants.COOKIE).then((cookie) => {
      if (!cookie) return;
      client.authStore.loadFromCookie(cookie);
    });

    return pocketbase;
  }, [serverURL]);

  return <ClientContext.Provider value={{ client }}>{children}</ClientContext.Provider>;
}
