import { useContext } from 'react';
import { SubscriptionsContext } from '../context/subscriptions/context';
import type { SubscribeFieldMap } from '../types';

export const useFieldMap = (collection: string): SubscribeFieldMap => {
  const { expand, fileFields } = useContext(SubscriptionsContext)?.[collection] ?? {};
  return {
    expand,
    fileFields,
  };
};
