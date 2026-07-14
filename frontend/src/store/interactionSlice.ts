import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { InteractionData } from '../types';
import { getInteraction } from '../services/api';

// ── State ─────────────────────────────────────────────────────────────────────

interface InteractionState {
  interactionId: number | null;
  data: InteractionData | null;
  loading: boolean;
  error: string | null;
}

const initialState: InteractionState = {
  interactionId: null,
  data: null,
  loading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const loadInteractionDetail = createAsyncThunk<
  InteractionData,
  number,
  { rejectValue: string }
>(
  'interaction/loadDetail',
  async (interactionId, { dispatch, rejectWithValue }) => {
    try {
      const data = await getInteraction(interactionId);
      dispatch(setInteractionId(interactionId));
      return data as InteractionData;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to load interaction details';
      return rejectWithValue(message);
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    setInteractionData(state, action: PayloadAction<InteractionData>) {
      state.data = action.payload;
    },
    setInteractionId(state, action: PayloadAction<number>) {
      state.interactionId = action.payload;
    },
    clearInteraction(state) {
      state.data = null;
      state.interactionId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInteractionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInteractionDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(loadInteractionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { setInteractionData, setInteractionId, clearInteraction } =
  interactionSlice.actions;
export default interactionSlice.reducer;
