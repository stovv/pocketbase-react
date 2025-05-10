import { createContext } from 'react';
import type { SubscribeModel } from '../../types';

export const SubscriptionsContext = createContext<SubscribeModel>({});
