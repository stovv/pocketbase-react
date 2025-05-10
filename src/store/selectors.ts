import { createSelectorCreator, lruMemoize } from '@reduxjs/toolkit';
import type { RootState } from './index';
import isEqual from 'react-fast-compare';

const createDeepEqualSelector = createSelectorCreator(lruMemoize, isEqual);

export const contentSelector = (store: RootState) => store.content;

export const collectionSelector = (
  collection: string,
  options?: { sortIndexes?: { [id: string]: number }; filterIds?: string[] },
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
        ?.filter((item) => filterIds.size === 0 || filterIds.has(item.id))
        // Sort items based on provided sortIndexes, default to 0 if index not found
        ?.sort((a, b) => {
          if (sortIndexes.size === 0) return 0;
          return (sortIndexes?.[a.id] ?? 0) - (sortIndexes?.[b.id] ?? 0);
        })
    );
  });

export const recordSelector = (collection: string, id: string | null) =>
  createDeepEqualSelector(contentSelector, (state) =>
    id ? (state?.[collection]?.records?.[id] ?? null) : null,
  );
