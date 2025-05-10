import { configureStore } from '@reduxjs/toolkit';
import { reducer as content } from './content';
import { useDispatch, useSelector } from 'react-redux';

export const store = configureStore({
  reducer: { content },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useLibDispatch = useDispatch.withTypes<AppDispatch>();
export const useLibSelector = useSelector.withTypes<RootState>();
