import { useLibSelector } from '../../store';
import { collectionSelector } from '../../store/selectors';
import type { BaseModel } from 'pocketbase';
import { useSubscribe } from './use-subscribe';
import { useFetch } from './use-fetch';
import type { UseCollectionProps } from '../../types';

export const useCollection = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
  { expand, fileFields, options = { limit: 20, sort: {} } }: UseCollectionProps,
) => {
  const { total, isInitialized, isLoading, next, sortIndexes, filterIds, error } =
    useFetch(collection, {
      expand,
      fileFields,
      ...options,
    });

  useSubscribe<RecordModel>(collection, {
    isLoading,
    isInitialized,
    expand,
    fileFields,
  });

  // Filtered and sorted data
  const data =
    (useLibSelector(
      collectionSelector(collection, {
        sortIndexes,
        filterIds,
      }),
    ) as RecordModel[]) || [];

  return {
    isLoading,
    isError: error !== null,
    error,
    isInitialized,
    isEnd: !data || !total || data.length >= total,
    data,
    next,
  };
};
