import { useContext } from 'react';
import { ConnectionStatusContext } from '../context/connection-status';

export function useConnectionStatus() {
  const context = useContext(ConnectionStatusContext);
  return !!context?.isConnected && !!context?.isInitialized;
}


export const useConnectionStatusContext = () => {
  const context = useContext(ConnectionStatusContext);

  return {
    isInitialized: !!context?.isInitialized,
    isConnected: !!context?.isConnected,
  }
}