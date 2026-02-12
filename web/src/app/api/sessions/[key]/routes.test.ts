import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCallOpenClawTool } = vi.hoisted(() => ({
  mockCallOpenClawTool: vi.fn(),
}));

vi.mock("@/lib/openclaw-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/openclaw-api")>("@/lib/openclaw-api");
  return {
    ...actual,
    callOpenClawTool: mockCallOpenClawTool,
  };
});

import { GET as getHistory } from "@/app/api/sessions/[key]/history/route";
import { GET as getStatus } from "@/app/api/sessions/[key]/status/route";
import { OpenClawApiError } from "@/lib/openclaw-api";

describe("session detail BFF routes", () => {
  beforeEach(() => {
    mockCallOpenClawTool.mockReset();
  });

  it("returns status payload", async () => {
    mockCallOpenClawTool.mockResolvedValue({
      status: {
        key: "main:abc",
        model: "gpt",
        reasoningEnabled: false,
        elapsedMs: 100,
        totalTokens: 10,
        promptTokens: 5,
        completionTokens: 5,
        costUsd: 0,
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    });

    const response = await getStatus(new Request("http://localhost"), {
      params: Promise.resolve({ key: "main:abc" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status.key).toBe("main:abc");
  });

  it("maps OpenClawApiError status", async () => {
    mockCallOpenClawTool.mockRejectedValue(new OpenClawApiError("forbidden", 403));

    const response = await getStatus(new Request("http://localhost"), {
      params: Promise.resolve({ key: "main:abc" }),
    });

    expect(response.status).toBe(403);
  });

  it("handles history limit validation", async () => {
    const response = await getHistory(new Request("http://localhost?limit=999"), {
      params: Promise.resolve({ key: "main:abc" }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });
});
