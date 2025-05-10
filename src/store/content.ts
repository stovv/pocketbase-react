import { createSlice } from '@reduxjs/toolkit';
import type {
  ContentState,
  DeleteRecord,
  SetCollection,
  SetRecord,
} from '../types/store';

const initialState: ContentState = {};

const contentSlice = createSlice({
  name: 'pb-content',
  initialState,
  reducers: {
    setCollection(state, action: SetCollection) {
      const { collection, data } = action.payload;

      if (!state[collection]) {
        state[collection] = {};
      }
      data.forEach((record) => {
        state[collection][record.id] = record;
      });
    },
    deleteRecord(state, action: DeleteRecord) {
      const { collection, id } = action.payload;
      if (!state?.[collection]?.[id]) return;
      state[collection][id] = null;
    },
    setRecord(state, action: SetRecord) {
      const { collection, record } = action.payload;
      if (!state[collection]) {
        state[collection] = {};
      }
      state[collection][record.id] = record;
    },
  },
});

export const { actions: contentActions, reducer } = contentSlice;
