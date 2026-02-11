export type SessionLifecycleStatus = "active" | "idle" | "stale" | "disconnected";

export type SessionSummary = {
  key: string;
  displayName: string;
  agentName: string;
  channel: string | null;
  status: SessionLifecycleStatus;
  updatedAt: string;
  lastMessageAt: string | null;
  totalTokens: number | null;
  lastTo: string | null;
};

export type SessionStatus = {
  key: string;
  model: string | null;
  reasoningEnabled: boolean;
  elapsedMs: number | null;
  totalTokens: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  costUsd: number | null;
  updatedAt: string | null;
};

export type HistoryRole = "system" | "user" | "assistant" | "tool";

export type HistoryItem = {
  id: string;
  role: HistoryRole;
  text: string;
  createdAt: string;
  toolName?: string;
};

export type SessionHistoryPage = {
  items: HistoryItem[];
  nextBefore: string | null;
};
