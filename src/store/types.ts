import type { PayloadAction } from '@reduxjs/toolkit';
import type { BaseModel } from 'pocketbase';
import type { ExpandType, FileFields } from '../types';
import type { useClient } from '../hooks';

export interface ContentState {
  [collection: string]: {
    [id: string]: BaseModel;
  };
}

export type SetCollectionAction = PayloadAction<{
  collection: string;
  data: BaseModel[];
  expand?: ExpandType;
  client?: ReturnType<typeof useClient>;
  fileFields?: FileFields;
}>;

export type SetRecordAction = PayloadAction<{
  collection: string;
  record: BaseModel;
  expand?: ExpandType;
  client?: ReturnType<typeof useClient>;
  fileFields?: FileFields;
}>;

export type DeleteRecordAction = PayloadAction<{
  collection: string;
  id: string;
}>;
