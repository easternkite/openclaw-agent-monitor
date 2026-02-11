import { RealtimeBadge } from "@/components/realtime/realtime-badge";

type ConnectionBannerProps = {
  status: "connected" | "reconnecting" | "disconnected";
  reconnectAttempts: number;
  abnormalClosureDetected?: boolean;
  lastCloseCode?: number | null;
  onRetryNow?: () => void;
};

const STATUS_STYLES: Record<ConnectionBannerProps["status"], string> = {
  connected: "border-status-active/30 bg-status-active/5",
  reconnecting: "border-status-idle/30 bg-status-idle/5",
  disconnected: "border-status-disconnected/30 bg-status-disconnected/5",
};

export function ConnectionBanner({
  status,
  reconnectAttempts,
  abnormalClosureDetected = false,
  lastCloseCode = null,
  onRetryNow,
}: ConnectionBannerProps) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${STATUS_STYLES[status]}`}>
      <div className="flex items-center gap-2">
        <RealtimeBadge status={status} />
        <span className="text-muted-foreground">Gateway 상태</span>
        {abnormalClosureDetected ? (
          <span className="text-xs text-status-disconnected">비정상 종료 감지{lastCloseCode ? ` (${lastCloseCode})` : ""}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {status === "connected" ? "연결 안정" : `연속 실패 ${reconnectAttempts}회`}
        </span>
        {status === "disconnected" && onRetryNow ? (
          <button
            type="button"
            onClick={onRetryNow}
            className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-surface-muted"
          >
            수동 재연결
          </button>
        ) : null}
      </div>
    </div>
  );
}
