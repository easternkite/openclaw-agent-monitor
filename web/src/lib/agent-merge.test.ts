import { describe, expect, it } from "vitest";

import { mergeAgentCards } from "@/lib/agent-merge";
import type { AgentDescriptor, SessionSummary } from "@/types";

describe("mergeAgentCards", () => {
  it("keeps latest session per agent and sorts by status priority", () => {
    const sessions: SessionSummary[] = [
      {
        key: "main:1",
        displayName: "Main",
        agentName: "main",
        channel: "discord",
        status: "idle",
        updatedAt: "2026-02-12T00:00:00.000Z",
        lastMessageAt: null,
        totalTokens: 1,
        lastTo: null,
      },
      {
        key: "main:2",
        displayName: "Main latest",
        agentName: "main",
        channel: "discord",
        status: "active",
        updatedAt: "2026-02-12T00:01:00.000Z",
        lastMessageAt: null,
        totalTokens: 2,
        lastTo: null,
      },
      {
        key: "agent-1:1",
        displayName: "Agent 1",
        agentName: "agent-1",
        channel: "discord",
        status: "stale",
        updatedAt: "2026-02-12T00:00:30.000Z",
        lastMessageAt: null,
        totalTokens: 1,
        lastTo: null,
      },
    ];

    const merged = mergeAgentCards(sessions);

    expect(merged).toHaveLength(2);
    expect(merged[0]?.agentName).toBe("main");
    expect(merged[0]?.session?.key).toBe("main:2");
    expect(merged[1]?.agentName).toBe("agent-1");
  });

  it("adds registry-only agent as idle(no-session)", () => {
    const sessions: SessionSummary[] = [];
    const registry: AgentDescriptor[] = [
      {
        agentKey: "agent-x",
        displayName: "Agent X",
        state: "idle(no-session)",
        sourceTag: "registry",
      },
    ];

    const merged = mergeAgentCards(sessions, registry);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.state).toBe("idle(no-session)");
    expect(merged[0]?.sourceTag).toBe("registry");
  });
});
