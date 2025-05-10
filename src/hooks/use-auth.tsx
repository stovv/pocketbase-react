import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth';
import { useClient } from './use-client';
import { useRecord } from './use-record';
import type { UseAuthProps } from '../types';
import type { BaseModel } from 'pocketbase';
import { prepareOptions } from '../utils';

export function useAuth<UserModel extends BaseModel>({ expand }: UseAuthProps) {
  const client = useClient();
  const context = useContext(AuthContext);
  const [isSigned, setIsSigned] = useState<boolean | null>(null);
  const [id, setUserId] = useState<string | null>(null);
  const { data: user, ...recordState } = useRecord<UserModel>('users', id, {
    expand,
  });

  async function updateAuth() {
    const signed = client?.authStore.token !== '' && client?.authStore.isValid;
    setIsSigned(signed);

    if (signed && client && client.authStore?.record) {
      const userId = client.authStore.record.id;
      setUserId(userId);
      try {
        await client.collection('users').getOne(userId, prepareOptions({ expand }));
      } catch (error) {
        console.error('Failed to fetch expanded user data:', error);
      }
    }
  }

  // Refresh token
  useEffect(() => {
    if (!client || !isSigned) return;
    client.collection('users').authRefresh();
  }, [isSigned, client]);

  // Initial update auth
  useEffect(() => {
    updateAuth();
    client?.authStore.onChange(() => {
      updateAuth();
    });
  }, [expand]);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // TODO: Add token refreshing

  return {
    isSigned,
    actions: context,
    ...recordState,
    user,
  };
}
