import { createSelectorCreator, lruMemoize } from '@reduxjs/toolkit';
import isEqual from 'react-fast-compare';
import { s } from 'vitest/dist/chunks/reporters.d.DG9VKi4m';
import type { Client, SubscribeFieldMap } from '../types';
import { resolveCollection, resolveRecord } from '../utils';
import type { RootState } from './index';

const createDeepEqualSelector = createSelectorCreator(lruMemoize, isEqual);

export const contentSelector = (store: RootState) => store.content;

export const collectionSelector = (
  collection: string,
  options?: { sortIndexes?: { [id: string]: number }; filterIds?: string[] | null },
) =>
  createDeepEqualSelector(contentSelector, (state) => {
    // Return null if collection doesn't exist
    if (!state[collection]) return null;
    // Return all values if no options provided
    if (!options) return Object.values(state[collection]);

    const filterIds = new Set(options?.filterIds ?? []);
    const sortIndexes = options?.sortIndexes ?? {};

    return (
      Object.values(state[collection])
        // Filter items if filterIds is provided, otherwise return all items
        ?.filter(
          (item) =>
            options.filterIds === null || (item !== null && filterIds.has(item.id)),
        )
        // Sort items based on provided sortIndexes, default to 0 if index not found
        ?.sort((a, b) => {
          if (sortIndexes.size === 0 || a === null || b === null) return 0;
          return (sortIndexes?.[a.id] ?? 0) - (sortIndexes?.[b.id] ?? 0);
        })
    );
  });

type ResolvedCollectionSelecrotProps = {
  collection: string;
  options: { sortIndexes?: { [id: string]: number }; filterIds?: string[] | null };
  client: Client;
} & SubscribeFieldMap;
export const resolvedCollectionSelector = ({
  collection,
  options,
  client,
  fileFields,
  expand,
}: ResolvedCollectionSelecrotProps) =>
  createDeepEqualSelector(collectionSelector(collection, options), (records) =>
    records ? resolveCollection(records, expand, fileFields, client) : null,
  );

export const recordSelector = (collection: string, id: string | null) =>
  createDeepEqualSelector(contentSelector, (state) =>
    id ? (state?.[collection]?.[id] ?? null) : null,
  );

type ResolvedRecordSelecrotProps = {
  collection: string;
  id: string | null;
  client: Client;
} & SubscribeFieldMap;
export const resolvedRecordSelector = ({
  collection,
  id,
  client,
  expand,
  fileFields,
}: ResolvedRecordSelecrotProps) =>
  createDeepEqualSelector(recordSelector(collection, id), (record) =>
    record ? resolveRecord(record, expand, fileFields, client) : null,
  );

export const isRecordDeletedSelector = (collection: string, id?: string | null) =>
  createDeepEqualSelector(contentSelector, (state) =>
    id ? state?.[collection]?.[id] === null : false,
  );

export const subscriptionsSelector = createDeepEqualSelector(
  (state: RootState) => state.subscribes,
  (subscribes) => ({
    collections: subscribes.collections || [],
    records: subscribes.records || [],
    hasSubscriptions: subscribes.collections.length > 0 || subscribes.records.length > 0,
  }),
);
