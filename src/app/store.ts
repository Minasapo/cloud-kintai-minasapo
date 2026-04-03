import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// eslint-disable-next-line import/no-cycle
import notificationReducer from "@/shared/lib/store/notificationSlice";

import type { RegisteredRtkApi } from "./apis";
import { rtkApis } from "./apis";

const apiReducers = rtkApis.reduce<
  Record<string, RegisteredRtkApi["reducer"]>
>((acc, api) => {
  acc[api.reducerPath] = api.reducer;
  return acc;
}, {});

const apiMiddleware = rtkApis.map((api) => api.middleware);

export const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    ...apiReducers,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(...apiMiddleware),
});

if (rtkApis.length) {
  setupListeners(store.dispatch);
}

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
