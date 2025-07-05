import { useEffect, useState } from 'react';
import { useClient } from './use-client';

import type { BaseModel } from 'pocketbase';
import { actions, useDispatch } from '../store';
import { prepareOptions } from '../utils';
import { useIsConnected } from './use-connection-status';
import { useFieldMap } from './use-field-map';

export const useSubscribeToRecord = <RecordModel extends BaseModel>(
  collection: string,
  id: string | null,
) => {
  const isConnected = useIsConnected();
  const client = useClient();
  const { expand, fileFields } = useFieldMap(collection);
  const dispatch = useDispatch();

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
