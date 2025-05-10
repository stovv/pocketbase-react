import { useEffect } from 'react';
import { prepareOptions } from '../../utils';
import { useClient } from '../use-client';
import { useLibDispatch } from '../../store';
import { actions } from '../../store/content';
import type { BaseModel } from 'pocketbase';
import type { UseSubscribeCollectionProps } from '../../types';

export const useSubscribe = <ResponseRecord extends BaseModel = BaseModel>(
  collection: string,
  { isInitialized, isLoading, expand, fileFields }: UseSubscribeCollectionProps,
) => {
  const client = useClient();
  const dispatch = useLibDispatch();

  /**
   * Subscribe for updates
   * */
  useEffect(() => {
    // Wait for client available, skip if not initialized or loading
    if (!client || !isInitialized || isLoading) return;

    // Subscribe for all topics in collection
    client.collection(collection).subscribe<ResponseRecord>(
      '*',
      async ({ action, record }) => {
        switch (action) {
          case 'delete': {
            dispatch(
              actions.deleteRecord({
                collection,
                id: record.id,
              }),
            );
            return;
          }
          case 'update': {
            dispatch(
              actions.setRecord({
                collection,
                record,
                expand,
                client,
                fileFields,
              }),
            );
            return;
          }
        }
      },
      prepareOptions({ expand }),
    );

    return () => {
      // Unsubscribe on unmount/restart useEffect
      client.collection(collection).unsubscribe('*');
    };
  }, [client, isInitialized, isLoading]);
};
