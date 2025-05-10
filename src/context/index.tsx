import React from 'react';
import type { FC } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';
import type { PocketBaseProviderProps } from '../types';
import { AuthProvider } from './auth';
import { ClientProvider } from './client';
import { ConnectionStatusProvider } from './connection-status';
import { Subscriptions } from './subscriptions';

export const Pocketbase: FC<PocketBaseProviderProps> = ({
  children,
  serverURL,
  connectionCheckInterval = 30,
  webRedirectUrl,
  mobileRedirectUrl,
  fieldsMap,
}) => {
  return (
    <ClientProvider serverURL={serverURL}>
      <ReduxProvider store={store}>
        <Subscriptions fieldsMap={fieldsMap}>
          <ConnectionStatusProvider checkInterval={connectionCheckInterval}>
            <AuthProvider
              webRedirectUrl={webRedirectUrl}
              mobileRedirectUrl={mobileRedirectUrl}
            >
              {children}
            </AuthProvider>
          </ConnectionStatusProvider>
        </Subscriptions>
      </ReduxProvider>
    </ClientProvider>
  );
};
