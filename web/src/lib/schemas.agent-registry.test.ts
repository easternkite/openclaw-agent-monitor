import { describe, expect, it } from "vitest";

import {
  parseAgentRegistrySnapshot,
  safeParseAgentRegistrySnapshot,
} from "@/lib/schemas";

describe("agent registry schemas", () => {
  it("parses valid agent registry snapshot", () => {
    const parsed = parseAgentRegistrySnapshot({
      generatedAt: "2026-02-12T00:00:00.000Z",
      agents: [
        {
          agentKey: "main",
          displayName: "Main Agent",
          state: "idle(no-session)",
          sourceTag: "registry",
        },
      ],
    });

    expect(parsed.generatedAt).toBe("2026-02-12T00:00:00.000Z");
    expect(parsed.agents[0]?.state).toBe("idle(no-session)");
  });

  it("fails safe-parse for invalid state", () => {
    const result = safeParseAgentRegistrySnapshot({
      generatedAt: "2026-02-12T00:00:00.000Z",
      agents: [
        {
          agentKey: "main",
          displayName: "Main Agent",
          state: "unknown",
          sourceTag: "registry",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
