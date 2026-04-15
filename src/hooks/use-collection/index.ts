import type { BaseModel } from 'pocketbase';
import { useEffect } from 'react';
import { actions, useDispatch, useSelector } from '../../store';
import { resolvedCollectionSelector } from '../../store/selectors';
import type { CollectionOptions } from '../../types';
import { useActions } from '../use-actions';
import { useClient } from '../use-client';
import { useFieldMap } from '../use-field-map';
import { useFetchCollection } from './use-fetch-collection';

export const useCollection = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
  options?: CollectionOptions,
) => {
  const client = useClient();
  const dispatch = useDispatch();
  const { realtime = true, ...baseOptions } = options ?? {};
  const collectionActions = useActions(collection);
  const { expand, fileFields } = useFieldMap(collection);
  const { total, isInitialized, isLoading, next, sortIndexes, filterIds, error } =
    useFetchCollection(collection, {
      expand,
      ...baseOptions,
    });

  useEffect(() => {
    if (!realtime) return;
    dispatch(actions.subscribeCollection(collection));
  }, [realtime]);

  // Filtered and sorted data
  const data =
    (useSelector(
      resolvedCollectionSelector({
        collection,
        expand,
        fileFields,
        client,
        options: {
          sortIndexes,
          filterIds,
        },
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
    actions: collectionActions,
  };
};
