"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ConnectionBanner } from "@/components/layout/connection-banner";
import { ErrorBoundaryPanel } from "@/components/layout/error-boundary-panel";
import { AgentOverviewGrid } from "@/components/overview/agent-overview-grid";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { useSessionsQuery } from "@/hooks/use-sessions-query";
import { useConnectionStatus, useReconnectAttempts, useSessionCount } from "@/stores/selectors";

export default function Home() {
  const { sessions, isInitialLoading, isRevalidating, error } = useSessionsQuery();
  useRealtimeSync();

  const connectionStatus = useConnectionStatus();
  const sessionCount = useSessionCount();
  const reconnectAttempts = useReconnectAttempts();

  return (
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
        <ConnectionBanner status={connectionStatus} reconnectAttempts={reconnectAttempts} />
      }
      errorBoundary={<ErrorBoundaryPanel message={error?.message ?? null} />}
      main={
        <div className="space-y-4">
          <AgentOverviewGrid sessions={sessions} />
          <div className="space-y-2 text-sm">
            {isInitialLoading ? <p>초기 스냅샷 로딩 중...</p> : null}
            {isRevalidating ? <p>스냅샷 재검증 중...</p> : null}
            {!isInitialLoading && !isRevalidating && !error ? <p>실시간 동기화 정상 동작 중</p> : null}
          </div>
        </div>
      }
      side={
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">상태 요약</p>
          <ul className="space-y-1">
            <li>연결 상태: {connectionStatus}</li>
            <li>재연결 시도: {reconnectAttempts}</li>
            <li>로딩: {isInitialLoading ? "yes" : "no"}</li>
          </ul>
        </div>
      }
    />
  );
}
