import React from 'react';
import type { FC } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/* Store and types */
import { store } from '../store';
import type { PocketBaseProviderProps } from '../types';

/* Context's */
import { AuthActionsProvider, AuthProvider } from './auth';
import { ClientProvider } from './client';
import { Subscriptions } from './subscriptions';
import { ConnectionStatusProvider } from './connection-status';

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
      <ConnectionStatusProvider checkInterval={connectionCheckInterval}>
        <ReduxProvider store={store}>
          <Subscriptions fieldsMap={fieldsMap}>
            <AuthProvider>
              <AuthActionsProvider
                webRedirectUrl={webRedirectUrl}
                mobileRedirectUrl={mobileRedirectUrl}
              >
                {children}
              </AuthActionsProvider>
            </AuthProvider>
          </Subscriptions>
        </ReduxProvider>
      </ConnectionStatusProvider>
    </ClientProvider>
  );
};
