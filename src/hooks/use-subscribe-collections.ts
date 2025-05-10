import { useEffect } from 'react';
import { useLibDispatch } from '../store';
import { actions } from '../store';
import { prepareOptions } from '../utils';
import { useClient } from './use-client';
import { useFieldMap } from './use-field-map';

export const useSubscribeToCollection = (collection: string) => {
  const client = useClient();
  const { expand, fileFields } = useFieldMap(collection);
  const dispatch = useLibDispatch();

  /**
   * Subscribe for updates
   * */
  useEffect(() => {
    // Wait for client available, skip if not initialized or loading
    if (!client) return;

    // Subscribe for all topics in collection
    client.collection(collection).subscribe(
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
  }, [client, expand, fileFields]);
};
