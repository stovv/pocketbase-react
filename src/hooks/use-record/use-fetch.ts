import type { BaseModel } from 'pocketbase';
import { useEffect, useState } from 'react';
import { useDispatch } from '../../store';
import { actions } from '../../store';
import type { SubscribeFieldMap } from '../../types';
import { prepareOptions } from '../../utils';
import { useClient } from '../use-client';
import { useIsConnected } from '../use-connection-status';

export const useFetch = <RecordModel extends BaseModel>(
  collection: string,
  id: string | null,
  { expand }: SubscribeFieldMap,
) => {
  const client = useClient();
  const isConnected = useIsConnected();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setInitialized] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !id || !isConnected) return;
    setInitialized(true);

    client
      .collection(collection)
      .getOne<RecordModel>(id, prepareOptions({ expand }))
      .then(async (data) => {
        // Save data
        dispatch(
          actions.setRecord({
            collection,
            record: data,
          }),
        );
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client, collection, id, isConnected]);

  return {
    isLoading,
    isInitialized,
    isError: error !== null,
    error,
  };
};
