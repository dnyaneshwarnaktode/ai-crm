import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { sendMessage, getChatHistory } from '../services/api';
import type { ChatMessage, ChatApiResponse } from '../types';
import { setInteractionData, setInteractionId } from './interactionSlice';


// ── State ─────────────────────────────────────────────────────────────────────

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const sendChatMessage = createAsyncThunk<
  ChatApiResponse,
  { message: string; interactionId: number | null },
  { rejectValue: string }
>(
  'chat/sendMessage',
  async ({ message, interactionId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await sendMessage({
        message,
        interaction_id: interactionId,
      });

      // Auto-update form if interaction_data returned
      if (response.interaction_data) {
        dispatch(setInteractionData(response.interaction_data));
      }
      if (response.interaction_id) {
        dispatch(setInteractionId(response.interaction_id));
      }

      return response;
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to send message';
      return rejectWithValue(message);
    }
  },
);

export const loadChatHistory = createAsyncThunk<
  ChatMessage[],
  number,
  { rejectValue: string }
>(
  'chat/loadHistory',
  async (interactionId, { rejectWithValue }) => {
    try {
      const history = await getChatHistory(interactionId);
      return history.map((m) => ({
        id: `db-${m.id}`,
        role: m.role as 'user' | 'assistant',
        content: m.message,
        timestamp: m.created_at,
      }));
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to load history';
      return rejectWithValue(message);
    }
  },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearError(state) {
      state.error = null;
    },
    clearChat(state) {
      state.messages = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: action.payload.assistant_message,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
      .addCase(loadChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(loadChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { addUserMessage, clearError, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
