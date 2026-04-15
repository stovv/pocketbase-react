import type { FileOptions } from 'pocketbase';

/** Базовые типы для расширений и файловых полей */
export type ExpandType = string[];
export type FileFields = {
  single?: (string | { key: string; options: FileOptions })[];
  multiple?: (string | { key: string; options: FileOptions })[];
};

/** Типы для хуков аутентификации */

/** Типы для хуков записей */
export type UseSubscribeRecordProps = {
  id?: string;
  expand?: ExpandType;
  fileFields?: FileFields;
  isInitialized: boolean;
  isLoading: boolean;
};

export type RecordDescription = {
  id: string;
  collection: string;
};

/** Типы для хуков коллекций */
export type UseFetchCollectionProps = CollectionOptions & {
  expand?: ExpandType;
};

export type CollectionOptions = {
  limit?: number;
  sort?: {
    [key: string]: 'desc' | 'asc';
  };
  filter?: string;
  realtime?: boolean;
};
