import type React from 'react';

export type PocketBaseProviderProps = {
  serverURL: string;
  children: React.ReactNode;
  connectionCheckInterval?: number;
  webRedirectUrl?: string;
  mobileRedirectUrl?: string;
  // openURL: (url: string) => Promise<void>;
  // initialCollections?: string[];
};
