import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './features/jobSlice/jobSlice';
import sortReducer from './features/jobSlice/sortSlice';
import joblistSlice from './features/jobSlice/jobListSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      job: jobReducer.reducer,
      jobStateSort: sortReducer.reducer,
      joblist:joblistSlice.reducer
    },
  });
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import talentProfileReducer from "./features/talent_profile/talentProfileSlice";
import talentPoolProfileReducer from "./features/talent_pool_profile/talentPoolProfileSlice";
import cvReviewerReducer from "./features/cv_reviewer/cvReviewerSlice";

// Configure persist options
const persistConfig = {
  key: "profile-storage",
  storage,
  whitelist: ["talentProfile"], // Only persist the profile slice
};

const rootReducer = combineReducers({
  talentProfile: talentProfileReducer,
  talentPoolProfile: talentPoolProfileReducer,
  cvReviewer: cvReviewerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

