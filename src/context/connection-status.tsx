import React from 'react';
import { createContext, useEffect, useState } from 'react';
import { useClient } from '../hooks/use-client';
import type { ConnectionContextType, ConnectionStatusProviderProps } from '../types';

export const ConnectionStatusContext = createContext<ConnectionContextType | null>(null);

export function ConnectionStatusProvider({
  children,
  checkInterval: seconds = 30, // default check every 30 seconds
}: ConnectionStatusProviderProps) {
  const checkInterval = seconds * 1000;
  const client = useClient();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      client.health
        .check()
        .then(() => {
          setIsConnected(true);
        })
        .catch(() => {
          setIsConnected(false);
        });
    };

    checkConnection();

    const interval = setInterval(checkConnection, checkInterval);
    return () => clearInterval(interval);
  }, [client, checkInterval]);

  return (
    <ConnectionStatusContext.Provider value={{ isConnected }}>
      {children}
    </ConnectionStatusContext.Provider>
  );
}
