import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { InteractionData } from '../types';

// ── State ─────────────────────────────────────────────────────────────────────

interface InteractionState {
  interactionId: number | null;
  data: InteractionData | null;
}

const initialState: InteractionState = {
  interactionId: null,
  data: null,
};

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
    },
  },
});

export const { setInteractionData, setInteractionId, clearInteraction } =
  interactionSlice.actions;
export default interactionSlice.reducer;
