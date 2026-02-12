// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseSessionDetail } = vi.hoisted(() => ({
  mockUseSessionDetail: vi.fn(),
}));

vi.mock("@/hooks/use-session-detail", () => ({
  useSessionDetail: mockUseSessionDetail,
}));

import { SessionDetailPanel } from "@/components/session/session-detail-panel";
import { SessionTable } from "@/components/session/session-table";
import { useUiStore } from "@/stores/ui-store";
import type { HistoryItem, SessionStatus, SessionSummary } from "@/types";

const sessionRows: SessionSummary[] = [
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
];

const statusBySessionKey: Record<string, SessionStatus> = {
  "main:abc": {
    key: "main:abc",
    model: "gpt-5",
    reasoningEnabled: true,
    elapsedMs: 1500,
    totalTokens: 321,
    promptTokens: 200,
    completionTokens: 121,
    costUsd: 0.012,
    updatedAt: "2026-02-12T10:00:00.000Z",
  },
};

const historyBySessionKey: Record<string, HistoryItem[]> = {
  "main:abc": [
    {
      id: "h1",
      role: "user",
      text: "Check latest heartbeat",
      createdAt: "2026-02-12T09:59:30.000Z",
    },
  ],
};

describe("session selection flow", () => {
  beforeEach(() => {
    useUiStore.setState({
      selectedSessionKey: null,
      filter: { agent: null, channel: null, query: "" },
      detailPanelOpen: false,
    });

    mockUseSessionDetail.mockReset();
    mockUseSessionDetail.mockImplementation((sessionKey: string | null) => ({
      status: sessionKey ? statusBySessionKey[sessionKey] ?? null : null,
      history: sessionKey ? historyBySessionKey[sessionKey] ?? [] : [],
      isLoading: false,
      error: null,
    }));
  });

  it("renders selected session detail after table row click", () => {
    render(
      <>
        <SessionTable sessions={sessionRows} />
        <SessionDetailPanel />
      </>,
    );

    expect(screen.getByText("세션을 선택하면 상세 정보가 표시됩니다.")).toBeTruthy();

    fireEvent.click(screen.getByText("Main Session"));

    expect(screen.getByText("Session Status")).toBeTruthy();
    expect(screen.getByText("Key: main:abc")).toBeTruthy();
    expect(screen.getByText("Model: gpt-5")).toBeTruthy();
    expect(screen.getByText("Tokens: 321")).toBeTruthy();
    expect(screen.getByText("Recent History")).toBeTruthy();
    expect(screen.getByText("Check latest heartbeat")).toBeTruthy();
  });

  it("shows empty-state message when no sessions match", () => {
    render(<SessionTable sessions={[]} />);

    expect(screen.getByText("조건에 맞는 세션이 없습니다.")).toBeTruthy();
  });
});
