import { createSlice } from '@reduxjs/toolkit';
import type {
  SubscribeCollection,
  SubscribeRecord,
  SubscribesState,
  UnSubscribeCollection,
  UnSubscribeRecord,
} from '../types/store';
import { findRecordSubscribe, getRecordDescription, hasRecordSubscribe } from '../utils';

const initialState: SubscribesState = {
  collections: [],
  records: [],
};

const subscribesSlice = createSlice({
  name: 'pb-subscribes',
  initialState,
  reducers: {
    subscribeCollection(state, action: SubscribeCollection) {
      const collections = new Set(state.collections);
      if (collections.has(action.payload)) return;
      state.collections.push(action.payload);
    },
    subscribeRecord(state, action: SubscribeRecord) {
      if (hasRecordSubscribe(state.records, action.payload)) return;
      state.records.push(getRecordDescription(action.payload));
    },
    unsubscribeCollection(state, action: UnSubscribeCollection) {
      const collections = new Set(state.collections);
      if (!collections.has(action.payload)) return;
      collections.delete(action.payload);
    },
    unsubscribeRecord(state, action: UnSubscribeRecord) {
      const index = findRecordSubscribe(state.records, action.payload);
      if (index === -1) return;
      state.records.splice(index, 1);
    },
  },
});

export const { actions: subscribeActions, reducer } = subscribesSlice;
