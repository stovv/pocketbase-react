import { contentActions } from './content';
import { subscribeActions } from './subscribes';

export const actions = {
  ...contentActions,
  ...subscribeActions,
};
