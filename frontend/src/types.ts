// Types shared across the Redux store

export interface InteractionData {
  hcp_name: string | null;
  interaction_type: string | null;
  interaction_date: string | null;
  interaction_time: string | null;
  attendees: string | null;
  topics_discussed: string | null;
  summary: string | null;
  products: string[];
  materials_shared: string[];
  samples_distributed: string[];
  sentiment: string | null;
  outcomes: string | null;
  follow_up: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatApiResponse {
  success: boolean;
  assistant_message: string;
  interaction_data: InteractionData | null;
  interaction_id: number | null;
}
