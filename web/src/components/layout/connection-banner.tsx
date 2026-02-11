import { RealtimeBadge } from "@/components/realtime/realtime-badge";

type ConnectionBannerProps = {
  status: "connected" | "reconnecting" | "disconnected";
  reconnectAttempts: number;
};

const STATUS_STYLES: Record<ConnectionBannerProps["status"], string> = {
  connected: "border-status-active/30 bg-status-active/5",
  reconnecting: "border-status-idle/30 bg-status-idle/5",
  disconnected: "border-status-disconnected/30 bg-status-disconnected/5",
};

export function ConnectionBanner({ status, reconnectAttempts }: ConnectionBannerProps) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${STATUS_STYLES[status]}`}>
      <div className="flex items-center gap-2">
        <RealtimeBadge status={status} />
        <span className="text-muted-foreground">Gateway 상태</span>
      </div>
      <span className="text-xs text-muted-foreground">
        {status === "connected" ? "연결 안정" : `재시도 ${reconnectAttempts}회`}
      </span>
    </div>
  );
}
