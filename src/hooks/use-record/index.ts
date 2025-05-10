import type { BaseModel } from 'pocketbase';
import { useEffect } from 'react';
import { actions, useLibDispatch, useLibSelector } from '../../store';
import { isRecordDeletedSelector, resolvedRecordSelector } from '../../store/selectors';
import { useActions } from '../use-actions';
import { useClient } from '../use-client';
import { useFieldMap } from '../use-field-map';
import { useFetch } from './use-fetch';

export const useRecord = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
  id: string | null,
  realtime?: boolean,
) => {
  const client = useClient();
  const fieldMap = useFieldMap(collection);
  const collectionAction = useActions(collection);
  const dispatch = useLibDispatch();
  const { isLoading, isError, error, isInitialized } = useFetch(collection, id, fieldMap);
  const isDeleted = useLibSelector(isRecordDeletedSelector(collection, id));

  const data = useLibSelector(
    resolvedRecordSelector({
      collection,
      id,
      client,
      ...fieldMap,
    }),
  ) as RecordModel;

  useEffect(() => {
    if (!id || !realtime) return;
    dispatch(actions.subscribeRecord({ collection, id }));
  }, [id]);

  return {
    isDeleted,
    isLoading,
    isError,
    isInitialized,
    error,
    data,
    actions: collectionAction,
  };
};
