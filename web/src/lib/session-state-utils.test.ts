import { describe, expect, it } from "vitest";

import { computeStatus } from "@/lib/session-state-utils";

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
