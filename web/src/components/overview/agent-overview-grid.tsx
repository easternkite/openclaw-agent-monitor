import { RealtimeBadge } from "@/components/realtime/realtime-badge";
import { mapSessionToCard } from "@/lib/session-state-utils";
import type { SessionLifecycleStatus, SessionSummary } from "@/types";

type AgentOverviewGridProps = {
  sessions: SessionSummary[];
};

const AGENT_SLOTS = ["main", "agent-1", "agent-2", "agent-3", "agent-4"] as const;

function toRealtimeBadgeStatus(status: SessionLifecycleStatus): "connected" | "reconnecting" | "disconnected" {
  if (status === "active") return "connected";
  if (status === "idle") return "reconnecting";
  return "disconnected";
}

function pickLatestSession(sessions: SessionSummary[], agentName: string) {
  return sessions
    .filter((session) => session.agentName === agentName)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

export function AgentOverviewGrid({ sessions }: AgentOverviewGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {AGENT_SLOTS.map((agentName) => {
        const latest = pickLatestSession(sessions, agentName);

        if (!latest) {
          return (
            <article key={agentName} className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-medium">{agentName}</p>
              <p className="mt-2 text-xs text-muted-foreground">활성 세션 없음</p>
            </article>
          );
        }

        const card = mapSessionToCard(latest);

        return (
          <article key={agentName} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{agentName}</p>
              <RealtimeBadge status={toRealtimeBadgeStatus(card.status)} />
            </div>
            <p className="mt-2 truncate text-sm">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.updatedAgoLabel} · 토큰 {card.totalTokensLabel}
            </p>
          </article>
        );
      })}
    </div>
  );
}
