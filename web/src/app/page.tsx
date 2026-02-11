"use client";

import { Suspense } from "react";

import { ErrorNotice } from "@/components/feedback/error-notice";
import { ErrorToast } from "@/components/feedback/error-toast";
import { AppShell } from "@/components/layout/app-shell";
import { ConnectionBanner } from "@/components/layout/connection-banner";
import { ErrorBoundaryPanel } from "@/components/layout/error-boundary-panel";
import { AgentOverviewGrid } from "@/components/overview/agent-overview-grid";
import { SessionDetailPanel } from "@/components/session/session-detail-panel";
import { SessionFilters } from "@/components/session/session-filters";
import { SessionTable } from "@/components/session/session-table";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { useSessionsQuery } from "@/hooks/use-sessions-query";
import { filterSessions } from "@/lib/session-state-utils";
import { useConnectionStatus, useReconnectAttempts, useSessionCount } from "@/stores/selectors";
import { useUiStore } from "@/stores/ui-store";

export default function Home() {
  const { sessions, isInitialLoading, isRevalidating, error, refetch } = useSessionsQuery();
  const realtime = useRealtimeSync();

  const connectionStatus = useConnectionStatus();
  const sessionCount = useSessionCount();
  const reconnectAttempts = useReconnectAttempts();
  const filter = useUiStore((state) => state.filter);
  const selectedSessionKey = useUiStore((state) => state.selectedSessionKey);
  const selectSession = useUiStore((state) => state.selectSession);

  const filteredSessions = filterSessions(sessions, filter);
  const agentOptions = [...new Set(sessions.map((session) => session.agentName))].sort();
  const channelOptions = [...new Set(sessions.map((session) => session.channel).filter(Boolean) as string[])].sort();

  return (
    <>
      <AppShell
      header={
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">OpenClaw Monitor</h1>
            <p className="text-sm text-muted-foreground">실시간 세션 관제 대시보드</p>
          </div>
          <div className="text-sm text-muted-foreground">세션 {sessionCount}개</div>
        </div>
      }
      connectionBanner={
        <ConnectionBanner
          status={connectionStatus}
          reconnectAttempts={reconnectAttempts}
          abnormalClosureDetected={realtime.abnormalClosureDetected}
          lastCloseCode={realtime.lastCloseCode}
          onRetryNow={realtime.retryNow}
        />
      }
      errorBoundary={
        connectionStatus === "disconnected" ? (
          <ErrorNotice
            level="banner"
            message="Gateway 연결이 끊어졌습니다. 네트워크 상태를 확인하고 재시도하세요."
            onRetry={realtime.retryNow}
            onRefresh={() => window.location.reload()}
          />
        ) : (
          <ErrorBoundaryPanel message={error?.message ?? null} />
        )
      }
      main={
        <div className="space-y-4">
          <Suspense fallback={<div className="h-10 rounded-lg border border-border bg-surface-muted" />}>
            <SessionFilters agentOptions={agentOptions} channelOptions={channelOptions} />
          </Suspense>
          <AgentOverviewGrid
            sessions={filteredSessions}
            selectedSessionKey={selectedSessionKey}
            onSelectSession={selectSession}
          />
          <SessionTable sessions={filteredSessions} />
          <div className="space-y-2 text-sm">
            {isInitialLoading ? <p>초기 스냅샷 로딩 중...</p> : null}
            {isRevalidating ? <p>스냅샷 재검증 중...</p> : null}
            {error ? (
              <ErrorNotice
                level="inline"
                message={error.message}
                onRetry={() => {
                  void refetch();
                }}
                onRefresh={() => window.location.reload()}
              />
            ) : null}
            {!isInitialLoading && !isRevalidating && !error ? <p>실시간 동기화 정상 동작 중</p> : null}
          </div>
        </div>
      }
      side={
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">상태 요약</p>
            <ul className="space-y-1">
              <li>연결 상태: {connectionStatus}</li>
              <li>재연결 시도: {reconnectAttempts}</li>
              <li>로딩: {isInitialLoading ? "yes" : "no"}</li>
            </ul>
          </div>
          <SessionDetailPanel />
        </div>
      }
      />
      <ErrorToast message={error?.message ?? null} />
    </>
  );
}
