import { useContext } from 'react';
import { ClientContext } from '../context/client';

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a PocketBaseProvider');
  }
  return context.client;
}
