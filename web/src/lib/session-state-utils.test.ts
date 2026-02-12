import { describe, expect, it } from "vitest";

import { computeStatus, filterSessions } from "@/lib/session-state-utils";
import type { SessionSummary } from "@/types";

describe("computeStatus", () => {
  const baseNow = new Date("2026-02-12T00:00:10.000Z").getTime();

  it("returns active within 10 seconds", () => {
    const updatedAt = new Date(baseNow - 10_000).toISOString();
    expect(computeStatus(updatedAt, baseNow)).toBe("active");
  });

  it("returns idle between 10s and 60s", () => {
    const updatedAt = new Date(baseNow - 11_000).toISOString();
    expect(computeStatus(updatedAt, baseNow)).toBe("idle");
  });

  it("returns stale after 60s", () => {
    const updatedAt = new Date(baseNow - 61_000).toISOString();
    expect(computeStatus(updatedAt, baseNow)).toBe("stale");
  });

  it("returns disconnected for invalid dates", () => {
    expect(computeStatus("invalid-date", baseNow)).toBe("disconnected");
  });
});

describe("filterSessions", () => {
  const sessions: SessionSummary[] = [
    {
      key: "main:abc",
      displayName: "Main Session",
      agentName: "main",
      channel: "discord",
      status: "active",
      updatedAt: "2026-02-12T10:00:00.000Z",
      lastMessageAt: "2026-02-12T10:00:00.000Z",
      totalTokens: 321,
      lastTo: "operator",
    },
    {
      key: "agent:xyz",
      displayName: "Research Session",
      agentName: "agent",
      channel: "telegram",
      status: "idle",
      updatedAt: "2026-02-12T10:01:00.000Z",
      lastMessageAt: "2026-02-12T10:01:00.000Z",
      totalTokens: 120,
      lastTo: "dongyeon",
    },
  ];

  it("supports scoped query by channel and recipient", () => {
    const filtered = filterSessions(sessions, { query: "channel:telegram to:dong" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.key).toBe("agent:xyz");
  });

  it("supports mixed free-text + scoped query", () => {
    const filtered = filterSessions(sessions, { query: "research recipient:dong" });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.displayName).toBe("Research Session");
  });
});
