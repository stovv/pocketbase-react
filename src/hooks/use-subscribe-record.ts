import { useEffect, useState } from 'react';
import { useClient } from './use-client';

import type { BaseModel } from 'pocketbase';
import { useLibDispatch } from '../store';
import { actions } from '../store/actions';
import { prepareOptions } from '../utils';
import { useFieldMap } from './use-field-map';
import { useConnectionStatus } from './use-connection-status';

export const useSubscribeToRecord = <RecordModel extends BaseModel>(
  collection: string,
  id: string | null,
) => {
  const isConnected = useConnectionStatus();
  const client = useClient();
  const { expand, fileFields } = useFieldMap(collection);
  const dispatch = useLibDispatch();

  useEffect(() => {
    if (!client || !id || !isConnected) return;

    client.collection(collection).subscribe<RecordModel>(
      id,
      async ({ action, record }) => {
        if (action === 'delete') {
          dispatch(
            actions.deleteRecord({
              collection,
              id,
            }),
          );

          await client.collection(collection).unsubscribe(id);
          return;
        }

        // Save data
        dispatch(
          actions.setRecord({
            collection,
            record,
          }),
        );
      },
      prepareOptions({ expand }),
    );

    return () => {
      client.collection(collection).unsubscribe(id);
    };
  }, [id, client, expand, fileFields, isConnected]);
};
