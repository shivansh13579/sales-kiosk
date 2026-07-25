import { configureStore } from "@reduxjs/toolkit";
import kioskReducer from "./slices/kioskSlice";
import galleryReducer from "./slices/gallerySlice";
import videoReducer from "./slices/videoSlice";
import inventoryReducer from "./slices/inventorySlice";

export const store = configureStore({
  reducer: {
    kiosk: kioskReducer,
    gallery: galleryReducer,
    videos: videoReducer,
    inventory: inventoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
