import type React from 'react';
import type { SubscribeModel } from './context';

/** Типы для провайдера PocketBase */
export type PocketBaseProviderProps = {
  /** URL сервера PocketBase */
  serverURL: string;
  /** Дочерние компоненты */
  children: React.ReactNode;
  /** Интервал проверки соединения в миллисекундах */
  connectionCheckInterval?: number;
  /** URL для веб-редиректа после аутентификации */
  webRedirectUrl?: string;
  /** URL для мобильного редиректа после аутентификации */
  mobileRedirectUrl?: string;
  fieldsMap?: SubscribeModel;
};
