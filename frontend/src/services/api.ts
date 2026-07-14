import axios from 'axios';
import type { ChatApiResponse } from '../types';

// Use relative URL — Vite proxy forwards to http://localhost:8000
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SendMessagePayload {
  message: string;
  interaction_id?: number | null;
}

export async function sendMessage(
  payload: SendMessagePayload,
): Promise<ChatApiResponse> {
  const { data } = await api.post<ChatApiResponse>('/chat/', payload);
  return data;
}

export async function getChatHistory(
  interactionId: number,
): Promise<{ id: number; role: string; message: string; created_at: string }[]> {
  const { data } = await api.get(`/chat/history/${interactionId}`);
  return data;
}

export async function getInteraction(interactionId: number) {
  const { data } = await api.get(`/interactions/${interactionId}`);
  return data;
}

export default api;
