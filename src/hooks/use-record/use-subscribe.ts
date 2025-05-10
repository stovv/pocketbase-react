import { useEffect, useState } from 'react';
import { useClient } from '../use-client';

import type { BaseModel } from 'pocketbase';
import { useLibDispatch } from '../../store';
import { actions } from '../../store/content';
import { prepareOptions } from '../../utils';
import type { UseSubscribeRecordProps } from '../../types';

export const useSubscribe = <RecordModel extends BaseModel>(
  collection: string,
  id: string | null,
  { isInitialized, isLoading, expand, fileFields }: UseSubscribeRecordProps,
) => {
  const client = useClient();
  const dispatch = useLibDispatch();
  const [isDeleted, setDeleted] = useState(false);

  useEffect(() => {
    if (!client || !id || !isInitialized || isLoading) return;

    client.collection(collection).subscribe<RecordModel>(
      id,
      async ({ action, record }) => {
        if (action === 'delete') {
          setDeleted(true);
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
            expand,
            client,
            fileFields,
          }),
        );
      },
      prepareOptions({ expand }),
    );

    return () => {
      client.collection(collection).unsubscribe(id);
    };
  }, [id, client, isInitialized, isLoading]);

  return {
    isDeleted,
  };
};
