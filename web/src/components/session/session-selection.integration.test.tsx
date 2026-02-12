/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionDetailPanel } from "@/components/session/session-detail-panel";
import { SessionTable } from "@/components/session/session-table";
import { useUiStore } from "@/stores/ui-store";
import type { HistoryItem, SessionStatus, SessionSummary } from "@/types";

const { mockUseSessionDetail } = vi.hoisted(() => ({
  mockUseSessionDetail: vi.fn(),
}));

vi.mock("@/hooks/use-session-detail", () => ({
  useSessionDetail: mockUseSessionDetail,
}));

describe("session selection integration", () => {
  const sessions: SessionSummary[] = [
    {
      key: "main:abc",
      displayName: "Main Session",
      agentName: "main",
      channel: "discord",
      status: "active",
      updatedAt: "2026-02-12T02:00:00.000Z",
      lastMessageAt: "2026-02-12T02:00:00.000Z",
      totalTokens: 321,
      lastTo: "dongyeon",
    },
  ];

  const statusByKey: Record<string, SessionStatus> = {
    "main:abc": {
      key: "main:abc",
      model: "gpt-5.3-codex",
      reasoningEnabled: false,
      elapsedMs: 1200,
      totalTokens: 321,
      promptTokens: 111,
      completionTokens: 210,
      costUsd: null,
      updatedAt: "2026-02-12T02:00:00.000Z",
    },
  };

  const historyByKey: Record<string, HistoryItem[]> = {
    "main:abc": [
      {
        id: "h1",
        role: "assistant",
        text: "테스트 히스토리 메시지",
        createdAt: "2026-02-12T02:00:00.000Z",
      },
    ],
  };

  beforeEach(() => {
    useUiStore.setState({
      selectedSessionKey: null,
      filter: { agent: null, channel: null, query: "" },
      detailPanelOpen: false,
    });

    mockUseSessionDetail.mockImplementation((sessionKey: string | null) => ({
      status: sessionKey ? statusByKey[sessionKey] : null,
      history: sessionKey ? historyByKey[sessionKey] ?? [] : [],
      isLoading: false,
      error: null,
    }));
  });

  it("updates detail panel after selecting a session row", () => {
    render(
      <>
        <SessionTable sessions={sessions} />
        <SessionDetailPanel />
      </>,
    );

    expect(screen.getByText("세션을 선택하면 상세 정보가 표시됩니다.")).toBeTruthy();

    fireEvent.click(screen.getByText("Main Session"));

    expect(screen.getByText("Key: main:abc")).toBeTruthy();
    expect(screen.getByText("Model: gpt-5.3-codex")).toBeTruthy();
    expect(screen.getByText("테스트 히스토리 메시지")).toBeTruthy();
  });
});
