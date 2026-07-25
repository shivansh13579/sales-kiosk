import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Tower, Unit } from "../../types";
import { api } from "../../api/client";

export const fetchInventory = createAsyncThunk("inventory/fetch", async () => {
  const res = await api.getInventory();
  return res.data;
});

interface InventoryState {
  towers: Tower[];
  loading: boolean;
  error: string | null;
  bookingInProgress: boolean;
}

const initialState: InventoryState = {
  towers: [],
  loading: false,
  error: null,
  bookingInProgress: false,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // Fired when the server broadcasts "inventory-update" after any
    // successful booking, on any device — this is what makes
    // "102 - Booked" appear on every screen without a refresh.
    applyUnitUpdates(state, action: PayloadAction<Unit[]>) {
      const byId = new Map(action.payload.map((u) => [u.id, u]));
      state.towers = state.towers.map((tower) => ({
        ...tower,
        units: tower.units.map((unit) => byId.get(unit.id) ?? unit),
      }));
    },
    setBookingInProgress(state, action: PayloadAction<boolean>) {
      state.bookingInProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.towers = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load inventory.";
      });
  },
});

export const { applyUnitUpdates, setBookingInProgress } = inventorySlice.actions;
export default inventorySlice.reducer;
