import { RealtimeBadge } from "@/components/realtime/realtime-badge";
import { mergeAgentCards } from "@/lib/agent-merge";
import { mapSessionToCard } from "@/lib/session-state-utils";
import type { AgentDescriptor, AgentLifecycleStatus, SessionSummary } from "@/types";

type AgentOverviewGridProps = {
  sessions: SessionSummary[];
  registryAgents?: AgentDescriptor[];
  selectedSessionKey: string | null;
  onSelectSession: (sessionKey: string) => void;
};

function toRealtimeBadgeStatus(status: AgentLifecycleStatus): "connected" | "reconnecting" | "disconnected" {
  if (status === "active") return "connected";
  if (status === "idle" || status === "idle(no-session)") return "reconnecting";
  return "disconnected";
}

export function AgentOverviewGrid({
  sessions,
  registryAgents = [],
  selectedSessionKey,
  onSelectSession,
}: AgentOverviewGridProps) {
  const cards = mergeAgentCards(sessions, registryAgents);

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
        표시할 에이전트 세션이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((item) => {
        if (!item.session) {
          return (
            <article key={item.agentName} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.agentName}</p>
                <RealtimeBadge status={toRealtimeBadgeStatus(item.state)} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">등록됨 · 활성 세션 없음</p>
            </article>
          );
        }

        const session = item.session;
        const card = mapSessionToCard(session);
        const selected = selectedSessionKey === session.key;

        return (
          <button
            key={item.agentName}
            type="button"
            onClick={() => onSelectSession(session.key)}
            className={`rounded-lg border bg-background p-3 text-left transition-all duration-200 ${
              selected
                ? "border-status-active/60 ring-2 ring-status-active/30"
                : "border-border hover:border-status-idle/50"
            } ${card.status === "stale" ? "animate-pulse" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.agentName}</p>
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
