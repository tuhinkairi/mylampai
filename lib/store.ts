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
import interviewerReducer from "./features/interview/interviewSlice";

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
  interviewerData: interviewerReducer,
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
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
