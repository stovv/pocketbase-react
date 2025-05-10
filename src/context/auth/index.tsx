import type { AuthProviderInfo } from 'pocketbase';
import React, { useEffect, useState } from 'react';
import { useClient } from '../../hooks/use-client';
import { StorageService } from '../../services/storage';
import type { AuthActions, AuthProviderProps } from '../../types';
import { AuthContext } from './context';

export function AuthProvider({
  children,
  webRedirectUrl,
  mobileRedirectUrl,
}: AuthProviderProps) {
  const client = useClient();
  const [id, setUserId] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState<boolean | null>(null);
  const [authProviders, setAuthProviders] = useState<AuthProviderInfo[]>();

  async function updateAuth() {
    const signed = client?.authStore.token !== '' && client?.authStore.isValid;
    setIsSigned(signed);

    if (signed && client && client.authStore?.record) {
      const userId = client.authStore.record.id;
      setUserId(userId);
    }
  }

  useEffect(() => {
    updateAuth();
    client?.authStore.onChange(() => {
      updateAuth();
    });
  }, []);

  // Refresh token
  useEffect(() => {
    if (!client || !isSigned) return;
    client.collection('users').authRefresh();
  }, [isSigned, client]);

  const actions: AuthActions = {
    registerWithEmail: async (email, password) => {
      await client.collection('users').create({
        email: email,
        password: password,
        passwordConfirm: password,
      });
    },
    signInWithEmail: async (email, password) => {
      await client.collection('users').authWithPassword(email, password);
    },
    signInWithProvider: async (provider, openURL) => {
      const authProvider = authProviders?.find((p) => p.name === provider);
      const redirectURL =
        typeof document !== 'undefined' ? webRedirectUrl : mobileRedirectUrl;

      if (!redirectURL) {
        console.warn('Web redirect url or mobile redirect url is empty', {
          webRedirectUrl,
          mobileRedirectUrl,
        });
        return;
      }

      const url = authProvider?.authURL + redirectURL;

      await StorageService.set('provider', JSON.stringify(authProviders));
      await openURL(url);
    },
    submitProviderResult: async (urlOrParams) => {
      const params = new URLSearchParams(
        typeof urlOrParams === 'string' ? urlOrParams.split('?')[1] : urlOrParams,
      );
      const code = params.get('code');
      const state = params.get('state');
      const providersString = await StorageService.get('provider');
      const redirectURL =
        typeof document !== 'undefined' ? webRedirectUrl : mobileRedirectUrl;

      if (!redirectURL) {
        console.warn('Web redirect url or mobile redirect url is empty', {
          webRedirectUrl,
          mobileRedirectUrl,
        });
        return;
      }

      if (providersString) {
        const providers = JSON.parse(providersString) as AuthProviderInfo[];
        const authProvider = providers?.find((p) => p.state === state);
        if (authProvider && code) {
          await client
            .collection('users')
            .authWithOAuth2Code(
              authProvider.name,
              code,
              authProvider.codeVerifier,
              redirectURL,
            );
        }
      }
    },
    signOut: () => {
      client.authStore.clear();
    },
    sendPasswordResetEmail: async (email) => {
      await client.collection('users').requestPasswordReset(email);
    },
    sendEmailVerification: async (email) => {
      await client.collection('users').requestVerification(email);
    },
    updateProfile: async (id, record) => {
      await client.collection('profiles').update(id, record);
    },
    updateEmail: async (email) => {
      await client.collection('users').requestEmailChange(email);
    },
    deleteUser: async (id) => {
      await client.collection('users').delete(id);
    },
  };

  useEffect(() => {
    client
      .collection('users')
      .listAuthMethods()
      .then((methods) => {
        setAuthProviders(methods?.oauth2?.providers ?? []);
      })
      .catch(() => {
        // TODO: Add catch error
      });
  }, [client]);

  return (
    <AuthContext.Provider
      value={{
        id,
        actions,
        isSigned,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
