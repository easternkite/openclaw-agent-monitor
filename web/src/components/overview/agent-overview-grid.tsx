import { RealtimeBadge } from "@/components/realtime/realtime-badge";
import { mapSessionToCard } from "@/lib/session-state-utils";
import type { SessionLifecycleStatus, SessionSummary } from "@/types";

type AgentOverviewGridProps = {
  sessions: SessionSummary[];
  selectedSessionKey: string | null;
  onSelectSession: (sessionKey: string) => void;
};

const STATUS_PRIORITY: Record<SessionLifecycleStatus, number> = {
  active: 0,
  idle: 1,
  stale: 2,
  disconnected: 3,
};

function toRealtimeBadgeStatus(status: SessionLifecycleStatus): "connected" | "reconnecting" | "disconnected" {
  if (status === "active") return "connected";
  if (status === "idle") return "reconnecting";
  return "disconnected";
}

function resolveAgentName(session: SessionSummary): string {
  if (session.agentName.trim().length > 0) {
    return session.agentName;
  }

  return session.key.split(":")[0] ?? session.key;
}

function buildDynamicAgentCards(sessions: SessionSummary[]): SessionSummary[] {
  const latestByAgent = new Map<string, SessionSummary>();

  for (const session of sessions) {
    const agentName = resolveAgentName(session);
    const existing = latestByAgent.get(agentName);

    if (!existing) {
      latestByAgent.set(agentName, { ...session, agentName });
      continue;
    }

    const currentTime = new Date(session.updatedAt).getTime();
    const existingTime = new Date(existing.updatedAt).getTime();

    if (currentTime > existingTime) {
      latestByAgent.set(agentName, { ...session, agentName });
    }
  }

  return [...latestByAgent.values()].sort((a, b) => {
    const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function AgentOverviewGrid({
  sessions,
  selectedSessionKey,
  onSelectSession,
}: AgentOverviewGridProps) {
  const cards = buildDynamicAgentCards(sessions);

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
        표시할 에이전트 세션이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((session) => {
        const card = mapSessionToCard(session);
        const selected = selectedSessionKey === session.key;

        return (
          <button
            key={session.agentName}
            type="button"
            onClick={() => onSelectSession(session.key)}
            className={`rounded-lg border bg-background p-3 text-left transition-all duration-200 ${
              selected
                ? "border-status-active/60 ring-2 ring-status-active/30"
                : "border-border hover:border-status-idle/50"
            } ${card.status === "stale" ? "animate-pulse" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{session.agentName}</p>
              <RealtimeBadge status={toRealtimeBadgeStatus(card.status)} />
            </div>
            <p className="mt-2 truncate text-sm">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.updatedAgoLabel} · 토큰 {card.totalTokensLabel}
            </p>
          </button>
        );
      })}
    </div>
  );
}
