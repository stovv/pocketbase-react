import { createSlice } from '@reduxjs/toolkit';
import type {
  ContentState,
  DeleteRecordAction,
  SetCollectionAction,
  SetRecordAction,
} from './types';
import { processRecord } from '../utils';

const initialState: ContentState = {};

const contentSlice = createSlice({
  name: 'pocketbase-content',
  initialState,
  reducers: {
    setCollection(state, action: SetCollectionAction) {
      const { collection, data, expand, client, fileFields } = action.payload;
      data.forEach((record) =>
        processRecord(state, collection, record, expand, client, fileFields),
      );
    },
    deleteRecord(state, action: DeleteRecordAction) {
      const { collection, id } = action.payload;
      if (!state?.[collection]?.[id]) return;
      delete state[collection][id];
    },
    setRecord(state, action: SetRecordAction) {
      const { collection, record, expand, client, fileFields } = action.payload;
      processRecord(state, collection, record, expand, client, fileFields);
    },
  },
});

export const { actions, reducer } = contentSlice;
