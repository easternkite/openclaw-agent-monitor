import { parseAgentNameFromKey } from "@/lib/session-state-utils";
import type { AgentDescriptor, AgentLifecycleStatus, SessionSummary } from "@/types";

export type MergedAgentCard = {
  agentName: string;
  state: AgentLifecycleStatus;
  sourceTag: "session" | "registry" | "hybrid";
  session?: SessionSummary | undefined;
  updatedAt?: string | undefined;
};

const STATUS_PRIORITY: Record<AgentLifecycleStatus, number> = {
  active: 0,
  idle: 1,
  stale: 2,
  disconnected: 3,
  "idle(no-session)": 4,
};

function resolveAgentName(session: SessionSummary): string {
  if (session.agentName.trim().length > 0) {
    return session.agentName;
  }

  return parseAgentNameFromKey(session.key);
}

function latestSessionByAgent(sessions: SessionSummary[]): Map<string, SessionSummary> {
  const map = new Map<string, SessionSummary>();

  for (const session of sessions) {
    const agentName = resolveAgentName(session);
    const existing = map.get(agentName);

    if (!existing) {
      map.set(agentName, { ...session, agentName });
      continue;
    }

    if (new Date(session.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      map.set(agentName, { ...session, agentName });
    }
  }

  return map;
}

export function mergeAgentCards(
  sessions: SessionSummary[],
  registryAgents: AgentDescriptor[] = [],
): MergedAgentCard[] {
  const latestSessions = latestSessionByAgent(sessions);
  const merged = new Map<string, MergedAgentCard>();

  for (const session of latestSessions.values()) {
    merged.set(session.agentName, {
      agentName: session.agentName,
      state: session.status,
      sourceTag: "session",
      session,
      updatedAt: session.updatedAt,
    });
  }

  for (const agent of registryAgents) {
    const existing = merged.get(agent.agentKey);

    if (!existing) {
      merged.set(agent.agentKey, {
        agentName: agent.displayName || agent.agentKey,
        state: "idle(no-session)",
        sourceTag: "registry",
        updatedAt: agent.updatedAt,
      });
      continue;
    }

    merged.set(agent.agentKey, {
      ...existing,
      sourceTag: "hybrid",
    });
  }

  return [...merged.values()].sort((a, b) => {
    const priorityDiff = STATUS_PRIORITY[a.state] - STATUS_PRIORITY[b.state];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;

    return bTime - aTime;
  });
}
