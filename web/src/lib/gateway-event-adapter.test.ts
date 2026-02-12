import { describe, expect, it } from "vitest";

import { normalizeGatewayEvent } from "@/lib/gateway-event-adapter";
import type { GatewayEvent } from "@/types";

describe("normalizeGatewayEvent", () => {
  it("normalizes session.created event", () => {
    const event: GatewayEvent = {
      id: "e1",
      type: "session.created",
      at: "2026-02-12T00:00:00.000Z",
      payload: {
        key: "main:abc",
        agentName: "main",
        channel: "discord",
      },
    };

    const normalized = normalizeGatewayEvent(event);
    expect(normalized?.type).toBe("session.created");
    expect(normalized?.patch.key).toBe("main:abc");
    expect(normalized?.patch.agentName).toBe("main");
  });

  it("normalizes session.message role patch", () => {
    const event: GatewayEvent = {
      id: "e2",
      type: "session.message",
      at: "2026-02-12T00:00:05.000Z",
      payload: {
        key: "main:abc",
        role: "assistant",
      },
    };

    const normalized = normalizeGatewayEvent(event);
    expect(normalized?.type).toBe("session.message");
    expect(normalized?.patch.lastRole).toBe("assistant");
  });

  it("returns null when key is missing", () => {
    const event: GatewayEvent = {
      id: "e3",
      type: "session.updated",
      at: "2026-02-12T00:00:10.000Z",
      payload: {
        updatedAt: "2026-02-12T00:00:10.000Z",
      },
    };

    expect(normalizeGatewayEvent(event)).toBeNull();
  });
});
