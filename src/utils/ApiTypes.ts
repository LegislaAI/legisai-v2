export interface ThreadMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Thread {
  messages: ThreadMessage[];
}
interface RunUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
export interface Run {
  id?: string;
  object?: string;
  created_at?: number;
  assistant_id: string;
  thread_id?: string;
  status: string;
  started_at?: number;
  expires_at?: number | null;
  cancelled_at?: number | null;
  failed_at?: number | null;
  completed_at?: number | null;
  last_error?: string | null;
  model?: string;
  instructions?: string | null;
  incomplete_details?: unknown | null;
  tools?: Array<{
    type: string;
  }>;
  tool_resources?: {
    code_interpreter?: {
      file_ids: string[];
    };
  };
  metadata?: Record<string, unknown>;
  usage?: RunUsage;
  temperature?: number;
  top_p?: number;
  max_prompt_tokens?: number;
  max_completion_tokens?: number;
  truncation_strategy?: {
    type: string;
    last_messages?: number | null;
  };
  response_format?: string;
  tool_choice?: string;
  parallel_tool_calls?: boolean;
  thread?: {
    id: string;
    object?: string;
    created_at?: number;
  };
}

export interface Message {
  role: "user" | "assistant";
  content: {
    text: {
      value: string;
    };
  }[];
}

export interface ChunkingStrategy {
  type: string;
  static?: {
    max_chunk_size_tokens: number;
    chunk_overlap_tokens: number;
  };
}
export interface VectorStoreFile {
  id: string;
  object: "vector_store.file";
  created_at: number;
  vector_store_id: string;
  status: "in_progress" | "completed" | "cancelled" | "failed";
  last_error: string | null;
  chunking_strategy?: ChunkingStrategy;
  usage_bytes?: number;
}

export interface ListResponse<T> {
  object: "list";
  data: T[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

export interface ListRunsResponse {
  object: string;
  data: Run[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}
