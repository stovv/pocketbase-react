import type React from 'react';
import type { ReactNode } from 'react';
import type PocketBase from 'pocketbase';

/**
 * ClientContext
 * */
export interface PocketBaseContextType {
  client: PocketBase;
}

export interface ClientProviderProps {
  children: ReactNode;
  serverURL: string;
}

/**
 * ConnectionStatusContext
 * */
export interface ConnectionStatusContextType {
  isConnected: boolean;
}

/**
 * AuthContext
 * */
export type RegisterWithEmailType = (email: string, password: string) => Promise<void>;
export type SignInWithEmailType = (email: string, password: string) => Promise<void>;
export type SignInWithProviderType = (
  provider: string,
  openURL: (url: string) => Promise<void>,
) => Promise<void>;
export type SubmitProviderResultType = (
  urlOrParams: string | { code: string; state: string },
) => Promise<void>;
export type SignOutType = () => void;
export type SendPasswordResetEmailType = (email: string) => Promise<void>;
export type SendEmailVerificationType = (email: string) => Promise<void>;
export type UpdateProfileType = (
  id: string,
  record: Record<string, unknown>,
) => Promise<void>;
export type UpdateEmailType = (email: string) => Promise<void>;
export type DeleteUserType = (id: string) => Promise<void>;

export interface AuthActions {
  registerWithEmail: RegisterWithEmailType;
  signInWithEmail: SignInWithEmailType;
  signInWithProvider: SignInWithProviderType;
  submitProviderResult: SubmitProviderResultType;
  signOut: SignOutType;
  sendPasswordResetEmail: SendPasswordResetEmailType;
  sendEmailVerification: SendEmailVerificationType;
  updateProfile: UpdateProfileType;
  updateEmail: UpdateEmailType;
  deleteUser: DeleteUserType;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  webRedirectUrl?: string;
  mobileRedirectUrl?: string;
}
