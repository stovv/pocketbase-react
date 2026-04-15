import type { BaseModel } from 'pocketbase/dist/pocketbase.es';
import { useMemo } from 'react';
import { useClient } from './use-client';

export const useActions = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
) => {
  const client = useClient();

  return useMemo(
    () => ({
      create(record: Omit<RecordModel, 'id'>) {
        return client?.collection(collection).create(record);
      },
      update({ id, ...record }: RecordModel) {
        return client.collection(collection).update(id, record);
      },
      delete(id: string) {
        return client.collection(collection).delete(id);
      },
    }),
    [collection, client],
  );
};
