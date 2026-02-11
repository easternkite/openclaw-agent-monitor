import type { SessionLifecycleStatus, SessionSummary } from "@/types";

export type SessionCardView = {
  key: string;
  title: string;
  agentName: string;
  channelLabel: string;
  status: SessionLifecycleStatus;
  statusPriority: number;
  updatedAt: string;
  updatedAgoLabel: string;
  totalTokensLabel: string;
  lastTo: string | null;
};

const STATUS_PRIORITY: Record<SessionLifecycleStatus, number> = {
  active: 0,
  idle: 1,
  stale: 2,
  disconnected: 3,
};

export function parseAgentNameFromKey(sessionKey: string): string {
  const [head] = sessionKey.split(":");
  return head?.trim() || "unknown";
}

export function computeStatus(updatedAt: string, nowMs = Date.now()): SessionLifecycleStatus {
  const updatedMs = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedMs)) return "disconnected";

  const deltaMs = nowMs - updatedMs;
  if (deltaMs <= 10_000) return "active";
  if (deltaMs <= 60_000) return "idle";
  return "stale";
}

export function formatTokenCount(tokens: number | null): string {
  if (tokens === null) return "-";
  return new Intl.NumberFormat("en-US").format(tokens);
}

export function formatUpdatedAgo(updatedAt: string, nowMs = Date.now()): string {
  const updatedMs = new Date(updatedAt).getTime();
  if (Number.isNaN(updatedMs)) return "unknown";

  const diffSec = Math.max(0, Math.floor((nowMs - updatedMs) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function mapSessionToCard(session: SessionSummary, nowMs = Date.now()): SessionCardView {
  return {
    key: session.key,
    title: session.displayName,
    agentName: session.agentName || parseAgentNameFromKey(session.key),
    channelLabel: session.channel ?? "unknown",
    status: session.status,
    statusPriority: STATUS_PRIORITY[session.status],
    updatedAt: session.updatedAt,
    updatedAgoLabel: formatUpdatedAgo(session.updatedAt, nowMs),
    totalTokensLabel: formatTokenCount(session.totalTokens),
    lastTo: session.lastTo,
  };
}

export type SessionFilter = {
  agent?: string | null;
  channel?: string | null;
  query?: string;
};

export function filterSessions(sessions: SessionSummary[], filter: SessionFilter): SessionSummary[] {
  const normalizedQuery = filter.query?.trim().toLowerCase() ?? "";

  return sessions.filter((session) => {
    if (filter.agent && session.agentName !== filter.agent) return false;
    if (filter.channel && session.channel !== filter.channel) return false;

    if (!normalizedQuery) return true;

    const haystacks = [session.displayName, session.lastTo ?? "", session.key]
      .join(" ")
      .toLowerCase();

    return haystacks.includes(normalizedQuery);
  });
}

export function sortSessionsByUpdatedAt(sessions: SessionSummary[]): SessionSummary[] {
  return [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function sortSessionsByTokens(sessions: SessionSummary[]): SessionSummary[] {
  return [...sessions].sort((a, b) => (b.totalTokens ?? -1) - (a.totalTokens ?? -1));
}
