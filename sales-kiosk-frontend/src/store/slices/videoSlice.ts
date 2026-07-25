import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Video } from "../../types";
import { api } from "../../api/client";

export const fetchVideos = createAsyncThunk("videos/fetch", async () => {
  const res = await api.getVideos();
  return res.data;
});

interface VideoState {
  items: Video[];
  loading: boolean;
  error: string | null;
}

const initialState: VideoState = { items: [], loading: false, error: null };

const videoSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load videos.";
      });
  },
});

export default videoSlice.reducer;
