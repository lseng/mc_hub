export interface KBChunk {
  id: string;
  content: string;
  metadata?: {
    page_number?: number;
    section?: string;
    [key: string]: any;
  };
}

export interface KBSection {
  title: string;
  hint?: string;
}

export interface KBResponse {
  answer?: string; // Legacy field
  summary?: string;
  key_points?: string[];
  sections?: KBSection[];
  chunks: KBChunk[];
  resource_id: string;
  mode?: string;
}

export interface ConversationItem {
  question: string;
  response: KBResponse;
  timestamp: Date;
}