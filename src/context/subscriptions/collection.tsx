import type { FC } from 'react';
import { useSubscribeToCollection } from '../../hooks/use-subscribe-collections';
import type { CollectionSubscriptionProps } from '../../types';

export const CollectionSubscription: FC<CollectionSubscriptionProps> = ({
  collection,
}) => {
  useSubscribeToCollection(collection);

  return null;
};
