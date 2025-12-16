export interface Message {
  sender: 'user' | 'ai';
  message: string;
  translation?: string;
  timestamp: string;
}

export interface Correction {
  type: 'grammar_correction' | 'interjection_help';
  original?: string;
  corrected?: string;
  explanation: string;
}

export interface ChatAPIResponse {
  response: string;
  translation?: string;
  correction?: Correction;
}

export interface RandomTopicResponse {
  topic: string;
}
