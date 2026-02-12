"use client";

import { SessionActionGraph } from "@/components/session/session-action-graph";
import { useSessionDetail } from "@/hooks/use-session-detail";
import { ApiRequestError } from "@/lib/api-error";
import { useUiStore } from "@/stores/ui-store";

export function SessionDetailPanel() {
  const selectedSessionKey = useUiStore((state) => state.selectedSessionKey);
  const { status, history, isLoading, error } = useSessionDetail(selectedSessionKey);

  if (!selectedSessionKey) {
    return <p className="text-sm text-muted-foreground">세션을 선택하면 상세 정보가 표시됩니다.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">상세 정보를 불러오는 중...</p>;
  }

  if (error) {
    const userMessage = error instanceof ApiRequestError ? error.userMessage : error.message;
    return <p className="text-sm text-status-disconnected">상세 조회 오류: {userMessage}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-3">
        <p className="text-xs text-muted-foreground">Session Status</p>
        <p className="mt-1 text-sm">Key: {status?.key ?? selectedSessionKey}</p>
        <p className="text-sm">Model: {status?.model ?? "-"}</p>
        <p className="text-sm">Tokens: {status?.totalTokens ?? "-"}</p>
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <p className="mb-2 text-xs text-muted-foreground">Recent History</p>
        <ul className="space-y-2">
          {history.length === 0 ? <li className="text-sm text-muted-foreground">히스토리 없음</li> : null}
          {history.map((item) => (
            <li key={item.id} className="rounded border border-border/60 px-2 py-1 text-sm">
              <p className="text-xs text-muted-foreground">{item.role}</p>
              <p className="line-clamp-2">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-background p-3">
        <p className="mb-2 text-xs text-muted-foreground">Action Graph (Phase 2)</p>
        <SessionActionGraph history={history} />
      </div>
    </div>
  );
}
