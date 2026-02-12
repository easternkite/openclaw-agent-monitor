import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCallOpenClawTool } = vi.hoisted(() => ({
  mockCallOpenClawTool: vi.fn(),
}));

vi.mock("@/lib/openclaw-api", () => ({
  callOpenClawTool: mockCallOpenClawTool,
}));

import { GET } from "@/app/api/sessions/route";

describe("GET /api/sessions", () => {
  beforeEach(() => {
    mockCallOpenClawTool.mockReset();
  });

  it("maps sessions_list payload to normalized sessions", async () => {
    mockCallOpenClawTool.mockResolvedValue({
      sessions: [
        {
          key: "main:abc",
          displayName: "Main Session",
          channel: "discord",
          updatedAt: "2026-02-12T00:00:00.000Z",
          lastMessageAt: "2026-02-12T00:00:00.000Z",
          totalTokens: 123,
          lastTo: "dongyeon",
        },
      ],
    });

    const request = new Request("http://localhost/api/sessions");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sessions).toHaveLength(1);
    expect(body.sessions[0].key).toBe("main:abc");
    expect(body.sessions[0].agentName).toBe("main");
  });

  it("returns 502 on tool failure", async () => {
    mockCallOpenClawTool.mockRejectedValue(new Error("boom"));

    const request = new Request("http://localhost/api/sessions");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.error.message).toBe("boom");
  });
});
