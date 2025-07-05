import { useContext } from 'react';
import { ConnectionStatusContext } from '../context/connection-status';
import { ConnectionStatus } from '../types';

export function useConnectionStatus(): ConnectionStatus {
  const context = useContext(ConnectionStatusContext);

  if (!context?.isInitialized) {
    return 'initialize';
  }

  return !!context?.isConnected ? 'connected' : 'disconnected';
}

export const useIsConnected = () => {
  const connectionStatus = useConnectionStatus();
  return connectionStatus === 'connected';
};

export const useConnectionStatusContext = () => {
  const context = useContext(ConnectionStatusContext);

  return {
    isInitialized: !!context?.isInitialized,
    isConnected: !!context?.isConnected,
  };
};
