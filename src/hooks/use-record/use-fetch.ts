import { useEffect, useState } from 'react';
import { useClient } from '../use-client';
import type { BaseModel } from 'pocketbase';
import { useLibDispatch } from '../../store';
import { actions } from '../../store/content';
import type { UseRecordProps } from '../../types';
import { prepareOptions } from '../../utils';

export const useFetch = <RecordModel extends BaseModel>(
  collection: string,
  id: string | null,
  { expand, fileFields }: UseRecordProps,
) => {
  const client = useClient();
  const dispatch = useLibDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setInitialized] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client || !id) return;
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
            expand,
            client,
            fileFields,
          }),
        );
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e);
        setIsLoading(false);
      });
  }, [client, collection, id]);

  return {
    isLoading,
    isInitialized,
    isError: error !== null,
    error,
  };
};
