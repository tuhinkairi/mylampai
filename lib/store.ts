import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './features/jobSlice/jobSlice';
import sortReducer from './features/jobSlice/sortSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      job: jobReducer.reducer,
      jobStateSort: sortReducer.reducer  
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];