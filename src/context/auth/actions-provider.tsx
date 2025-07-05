import React from 'react';
import { AuthActions, AuthActionsProviderProps, AuthProviderProps } from '../../types';
import { useEffect, useMemo, useState } from 'react';
import { useClient, useIsConnected } from '../../hooks';
import type { AuthProviderInfo } from 'pocketbase';
import { StorageService } from '../../services/storage';
import { AuthActionsContext } from './context';

export function AuthActionsProvider({
  webRedirectUrl,
  mobileRedirectUrl,
  children,
}: AuthActionsProviderProps) {
  // external hooks
  const client = useClient();
  const isConnected = useIsConnected();
  const [authProviders, setAuthProviders] = useState<AuthProviderInfo[]>();

  useEffect(() => {
    if (!isConnected) return;

    client
      .collection('users')
      .listAuthMethods()
      .then((methods) => {
        setAuthProviders(methods?.oauth2?.providers ?? []);
      })
      .catch((e) => {
        console.error('Error list auth providers', e);
      });
  }, [client, isConnected]);

  // create AuthActions
  const actions: AuthActions = useMemo(
    () => ({
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
      signInWithProvider: async (provider, openURL, domainReplace) => {
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

        try {
          const url = new URL(authProvider?.authURL + redirectURL);
          if (domainReplace) {
            url.host = domainReplace;
          }

          await StorageService.set('provider', JSON.stringify(authProviders));
          await openURL(url.toString());
        } catch (e) {
          console.error('Broken url', e);
        }
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
    }),
    [],
  );

  return (
    <AuthActionsContext.Provider value={{ actions }}>
      {children}
    </AuthActionsContext.Provider>
  );
}
