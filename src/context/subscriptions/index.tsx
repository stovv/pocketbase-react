import React from 'react';
import type { FC, ReactNode } from 'react';
import { useSelector } from '../../store';
import { subscriptionsSelector } from '../../store/selectors';
import type { SubscribeModel } from '../../types';
import { CollectionSubscription } from './collection';
import { SubscriptionsContext } from './context';
import { RecordSubscription } from './record';

const SubscriptionsManager = () => {
  const { collections, records } = useSelector(subscriptionsSelector);

  return (
    <>
      {collections.map((collection) => (
        <CollectionSubscription collection={collection} key={collection} />
      ))}
      {records.map(([collection, id]) => {
        if (collections.includes(collection)) return null;
        return (
          <RecordSubscription
            collection={collection}
            id={id}
            key={`${collection}-${id}`}
          />
        );
      })}
    </>
  );
};

export const Subscriptions: FC<{
  children: ReactNode;
  fieldsMap?: SubscribeModel;
}> = ({ children, fieldsMap = {} }) => {
  return (
    <SubscriptionsContext.Provider value={fieldsMap}>
      <SubscriptionsManager />
      {children}
    </SubscriptionsContext.Provider>
  );
};
