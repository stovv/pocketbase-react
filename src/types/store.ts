import type { PayloadAction } from '@reduxjs/toolkit';
import type { BaseModel } from 'pocketbase';
import type { RecordDescription } from './hooks';

/** Базовая модель с поддержкой расширений */
export type BaseModelWithExpand = BaseModel & {
  expand?: Record<string, unknown>;
};

/** Состояние контента */
export type ContentState = {
  [collection: string]: {
    [id: string]: BaseModelWithExpand | null;
  };
};

/** Типы для действий хранилища */
export type SetCollection = PayloadAction<{
  collection: string;
  data: BaseModelWithExpand[];
}>;

export type SetRecord = PayloadAction<{
  collection: string;
  record: BaseModel;
}>;

export type DeleteRecord = PayloadAction<{
  collection: string;
  id: string;
}>;

/** Состояние подписок */
export type SubscribesState = {
  /** Коллекции, на которые оформлена подписка */
  collections: string[];
  /** Записи, на которые оформлена подписка */
  records: string[][];
};

/** Типы для действий подписок */
export type SubscribeCollection = PayloadAction<string>;
export type SubscribeRecord = PayloadAction<RecordDescription>;
export type UnSubscribeCollection = PayloadAction<string>;
export type UnSubscribeRecord = PayloadAction<RecordDescription>;
