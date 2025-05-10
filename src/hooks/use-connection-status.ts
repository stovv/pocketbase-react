import { useContext } from 'react';
import { ConnectionStatusContext } from '../context/connection-status';

export function useConnectionStatus() {
  const context = useContext(ConnectionStatusContext);
  if (!context) {
    throw new Error('useConnectionStatus must be used within a PocketBaseProvider');
  }
  return context.isConnected;
}
