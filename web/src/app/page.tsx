"use client";

import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { useSessionsQuery } from "@/hooks/use-sessions-query";
import { useConnectionStatus, useReconnectAttempts, useSessionCount } from "@/stores/selectors";

export default function Home() {
  const { isInitialLoading, isRevalidating, error } = useSessionsQuery();
  useRealtimeSync();

  const connectionStatus = useConnectionStatus();
  const sessionCount = useSessionCount();
  const reconnectAttempts = useReconnectAttempts();

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">OpenClaw Monitor</h1>
        <p className="text-sm text-muted-foreground">실시간 세션 상태 동기화 기본 구현</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Connection" value={connectionStatus} />
          <Metric label="Sessions" value={String(sessionCount)} />
          <Metric label="Reconnect attempts" value={String(reconnectAttempts)} />
        </div>

        <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm">
          {isInitialLoading ? <p>초기 스냅샷 로딩 중...</p> : null}
          {isRevalidating ? <p>스냅샷 재검증 중...</p> : null}
          {error ? <p className="text-status-disconnected">오류: {error.message}</p> : null}
          {!isInitialLoading && !isRevalidating && !error ? <p>정상 동작 중</p> : null}
        </div>
      </section>
    </main>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}
