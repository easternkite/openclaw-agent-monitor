import { describe, expect, it } from "vitest";

import { mergeAgentCards } from "@/lib/agent-merge";
import type { AgentDescriptor, SessionSummary } from "@/types";

describe("dynamic agent scenarios", () => {
  it("adds a newly arrived session agent", () => {
    const before: SessionSummary[] = [];
    const after: SessionSummary[] = [
      {
        key: "agent-new:1",
        displayName: "New Agent Session",
        agentName: "agent-new",
        channel: "discord",
        status: "active",
        updatedAt: "2026-02-12T01:00:00.000Z",
        lastMessageAt: null,
        totalTokens: 10,
        lastTo: null,
      },
    ];

    expect(mergeAgentCards(before)).toHaveLength(0);
    const merged = mergeAgentCards(after);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.agentName).toBe("agent-new");
  });

  it("keeps registry agent when session disappears", () => {
    const registry: AgentDescriptor[] = [
      {
        agentKey: "agent-keep",
        displayName: "Agent Keep",
        state: "idle(no-session)",
        sourceTag: "registry",
      },
    ];

    const merged = mergeAgentCards([], registry);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.sourceTag).toBe("registry");
    expect(merged[0]?.state).toBe("idle(no-session)");
  });

  it("removes card when both session and registry are gone", () => {
    const beforeSessions: SessionSummary[] = [
      {
        key: "agent-gone:1",
        displayName: "Agent Gone",
        agentName: "agent-gone",
        channel: "discord",
        status: "idle",
        updatedAt: "2026-02-12T00:30:00.000Z",
        lastMessageAt: null,
        totalTokens: 4,
        lastTo: null,
      },
    ];

    expect(mergeAgentCards(beforeSessions)).toHaveLength(1);
    expect(mergeAgentCards([])).toHaveLength(0);
  });
});
