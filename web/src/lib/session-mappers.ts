import type { SessionLifecycleStatus, SessionSummary } from "@/types";

const ACTIVE_WINDOW_MS = 10_000;
const IDLE_WINDOW_MS = 60_000;

export function parseAgentNameFromKey(sessionKey: string): string {
  const [head] = sessionKey.split(":");
  return head?.trim() || "unknown";
}

export function computeStatus(updatedAt: string, nowMs = Date.now()): SessionLifecycleStatus {
  const updatedMs = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedMs)) {
    return "disconnected";
  }

  const delta = nowMs - updatedMs;

  if (delta <= ACTIVE_WINDOW_MS) {
    return "active";
  }

  if (delta <= IDLE_WINDOW_MS) {
    return "idle";
  }

  return "stale";
}

type SessionRaw = {
  key: string;
  displayName: string | undefined;
  channel: string | null | undefined;
  updatedAt: string | undefined;
  lastMessageAt: string | null | undefined;
  totalTokens: number | null | undefined;
  lastTo: string | null | undefined;
};

export function mapSessionToSummary(raw: SessionRaw, nowMs = Date.now()): SessionSummary {
  const updatedAt = raw.updatedAt ?? new Date(0).toISOString();

  return {
    key: raw.key,
    displayName: raw.displayName ?? raw.key,
    agentName: parseAgentNameFromKey(raw.key),
    channel: raw.channel ?? null,
    status: computeStatus(updatedAt, nowMs),
    updatedAt,
    lastMessageAt: raw.lastMessageAt ?? null,
    totalTokens: raw.totalTokens ?? null,
    lastTo: raw.lastTo ?? null,
  };
}

export function maskSessionSummary(summary: SessionSummary): SessionSummary {
  return {
    ...summary,
    lastTo: summary.lastTo ? "***" : null,
  };
}
