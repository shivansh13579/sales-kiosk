import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KioskState, BookingResult } from "../../types";

interface KioskSliceState extends KioskState {
  connected: boolean;
  lastBookingResult: BookingResult | null;
}

const initialState: KioskSliceState = {
  activeTab: "gallery",
  openImageId: null,
  playingVideoId: null,
  selectedTowerId: null,
  selectedUnitId: null,
  openDialog: null,
  connected: false,
  lastBookingResult: null,
};

const kioskSlice = createSlice({
  name: "kiosk",
  initialState,
  reducers: {
    // This is the ONLY reducer that changes what's on screen for the
    // mirrored parts of the UI. It fires when the server's "state-update"
    // event arrives — never directly from a local click handler. That is
    // what keeps every connected device showing exactly the same thing.
    setKioskState(state, action: PayloadAction<KioskState>) {
      Object.assign(state, action.payload);
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setBookingResult(state, action: PayloadAction<BookingResult | null>) {
      state.lastBookingResult = action.payload;
    },
  },
});

export const { setKioskState, setConnected, setBookingResult } = kioskSlice.actions;
export default kioskSlice.reducer;
