import { socket } from "./socket";
import { store } from "../store/store";
import { setKioskState, setConnected, setBookingResult } from "../store/slices/kioskSlice";
import { applyUnitUpdates, setBookingInProgress } from "../store/slices/inventorySlice";
import { KioskState, BookingResult, Unit } from "../types";

export function registerSocketListeners() {
  socket.on("connect", () => store.dispatch(setConnected(true)));
  socket.on("disconnect", () => store.dispatch(setConnected(false)));

  // The single event that drives every mirrored screen element: active
  // tab, open image, playing video, selected tower/unit, open dialog.
  socket.on("state-update", (state: KioskState) => {
    store.dispatch(setKioskState(state));
  });

  socket.on("booking-result", (result: BookingResult) => {
    store.dispatch(setBookingInProgress(false));
    store.dispatch(setBookingResult(result));
    // Auto-clear the toast after a few seconds so it doesn't linger forever.
    setTimeout(() => store.dispatch(setBookingResult(null)), 4000);
  });

  socket.on("inventory-update", (units: Unit[]) => {
    store.dispatch(applyUnitUpdates(units));
  });
}
