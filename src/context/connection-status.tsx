import React from 'react';
import { createContext, useEffect, useState } from 'react';
import { useClient } from '../hooks';
import type { ConnectionContextType, ConnectionStatusProviderProps } from '../types';

export const ConnectionStatusContext = createContext<ConnectionContextType | null>(null);

export function ConnectionStatusProvider({
  children,
  checkInterval: seconds = 30, // default check every 30 seconds
}: ConnectionStatusProviderProps) {
  // external hooks
  const client = useClient();
  const checkInterval = seconds * 1000;

  // local state
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = () => {
      client.health
        .check()
        .then(() => {
          setIsConnected(true);
        })
        .catch(() => {
          setIsConnected(false);
        })
        .finally(() => {
          setIsInitialized(true);
        });
    };

    checkConnection();
    const interval = setInterval(checkConnection, checkInterval);
    return () => {
      clearInterval(interval);
    };
  }, [client, checkInterval]);

  return (
    <ConnectionStatusContext.Provider value={{ isConnected, isInitialized }}>
      {children}
    </ConnectionStatusContext.Provider>
  );
}
