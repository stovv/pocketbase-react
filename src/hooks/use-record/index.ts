import type { BaseModel } from 'pocketbase';
import { useFetch } from './use-fetch';
import { useLibSelector } from '../../store';
import { recordSelector } from '../../store/selectors';
import { ExpandType, type UseRecordProps } from '../../types';
import { useSubscribe } from './use-subscribe';

export const useRecord = <RecordModel extends BaseModel = BaseModel>(
  collection: string,
  id: string | null,
  { expand, fileFields }: UseRecordProps = {},
) => {
  const { isLoading, isError, error, isInitialized } = useFetch(collection, id, {
    expand,
    fileFields,
  });

  const { isDeleted } = useSubscribe(collection, id, {
    isLoading,
    isInitialized,
    expand,
    fileFields,
  });

  const data = useLibSelector(recordSelector(collection, id)) as RecordModel;

  return {
    isDeleted,
    isLoading,
    isError,
    isInitialized,
    error,
    data,
  };
};
