import React, { useCallback, useEffect, useState } from 'react';
import { useClient } from '../../hooks';
import type { AuthProviderProps } from '../../types';
import { AuthContext } from './context';

export function AuthProvider({ children }: AuthProviderProps) {
  // external hooks
  const client = useClient();

  // local state
  const [id, setUserId] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState<boolean | null>(null);

  const updateAuth = useCallback(() => {
    const signed = client?.authStore.token !== '' && client?.authStore.isValid;
    setIsSigned(signed);

    if (signed && client && client.authStore?.record) {
      const userId = client.authStore.record.id;
      setUserId(userId);
    }
  }, [client, setUserId, setIsSigned]);

  // Register update auth on authStore change
  useEffect(() => {
    updateAuth();

    client?.authStore.onChange(() => {
      updateAuth();
    });
  }, [updateAuth]);

  // Refresh token
  useEffect(() => {
    if (!client || !isSigned) return;
    client.collection('users').authRefresh();
  }, [isSigned, client]);

  return (
    <AuthContext.Provider
      value={{
        id,
        isSigned,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
