import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { reducer as content } from './content';
import { reducer as subscribes } from './subscribes';
export * from './actions';

export const store = configureStore({
  reducer: {
    content,
    subscribes,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useLibDispatch = useDispatch.withTypes<AppDispatch>();
export const useLibSelector = useSelector.withTypes<RootState>();
