import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GalleryImage } from "../../types";
import { api } from "../../api/client";

export const fetchGallery = createAsyncThunk("gallery/fetch", async () => {
  const res = await api.getGallery();
  return res.data;
});

interface GalleryState {
  items: GalleryImage[];
  loading: boolean;
  error: string | null;
}

const initialState: GalleryState = { items: [], loading: false, error: null };

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGallery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load gallery.";
      });
  },
});

export default gallerySlice.reducer;
