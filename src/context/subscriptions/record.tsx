import type { FC } from 'react';
import { useSubscribeToRecord } from '../../hooks/use-subscribe-record';
import type { RecordSubscriptionProps } from '../../types';

export const RecordSubscription: FC<RecordSubscriptionProps> = ({ id, collection }) => {
  useSubscribeToRecord(collection, id);

  return null;
};
