import React, { type FC } from 'react';
import { ClientProvider } from './client';
import { ConnectionStatusProvider } from './connection-status';
import { AuthProvider } from './auth';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';
import type { PocketBaseProviderProps } from '../types/provider';

export const PocketBaseProvider: FC<PocketBaseProviderProps> = ({
  children,
  serverURL,
  connectionCheckInterval = 30,
  webRedirectUrl,
  mobileRedirectUrl,
}) => {
  return (
    <ReduxProvider store={store}>
      <ClientProvider serverURL={serverURL}>
        <ConnectionStatusProvider checkInterval={connectionCheckInterval}>
          <AuthProvider
            webRedirectUrl={webRedirectUrl}
            mobileRedirectUrl={mobileRedirectUrl}
          >
            {children}
          </AuthProvider>
        </ConnectionStatusProvider>
      </ClientProvider>
    </ReduxProvider>
  );
};
