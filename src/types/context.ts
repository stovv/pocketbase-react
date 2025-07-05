import type PocketBase from 'pocketbase';
import type { ReactNode } from 'react';
import type { ExpandType, FileFields } from './hooks';

/** Типы для клиента PocketBase */
export type Client = PocketBase;
export type ClientContextType = {
  client: Client;
};

export type ClientProviderProps = {
  children: ReactNode;
  serverURL: string;
};

/** Типы для статуса подключения */
export type ConnectionContextType = {
  isConnected: boolean | null;
  isInitialized: boolean;
};

export type ConnectionStatusProviderProps = {
  children: ReactNode;
  checkInterval?: number; // check interval in milliseconds
};

/** Типы для аутентификации */
export type AuthContextType = {
  id: string | null;
  actions: AuthActions;
  isSigned: boolean | null;
};

export type AuthActions = {
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithProvider: (
    provider: string,
    openURL: (url: string) => Promise<void>,
    domainReplace?: string,
  ) => Promise<void>;
  submitProviderResult: (
    urlOrParams: string | { code: string; state: string },
  ) => Promise<void>;
  signOut: () => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
  updateProfile: (id: string, record: Record<string, unknown>) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

export type AuthProviderProps = {
  children: React.ReactNode;
  webRedirectUrl?: string;
  mobileRedirectUrl?: string;
};

/** Типы для подписок */
export type SubscribeFieldMap = {
  expand?: ExpandType;
  fileFields?: FileFields;
};

export type SubscribeModel = {
  [collection: string]: SubscribeFieldMap;
};

export type CollectionSubscriptionProps = {
  collection: string;
};

export type RecordSubscriptionProps = {
  id: string;
  collection: string;
};
