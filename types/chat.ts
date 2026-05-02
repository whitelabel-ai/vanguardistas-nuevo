export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  mimetype: string;
  timestamp: string;
  isMultiPart?: boolean;
  partIndex?: number;
  totalParts?: number;
}

export interface ChatSession {
  messages: ChatMessage[];
  sessionId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ApiChatResponse {
  response?: string;
  message?: string;
  text?: string;
  content?: string;
  answer?: string;
  reply?: string;
  output?: string;
  result?: string;
  Informe?: string;
  [key: string]: unknown;
}
