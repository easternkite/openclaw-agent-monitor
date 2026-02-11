type ConnectionBannerProps = {
  status: "connected" | "reconnecting" | "disconnected";
  reconnectAttempts: number;
};

const STATUS_STYLES: Record<ConnectionBannerProps["status"], string> = {
  connected: "border-status-active/40 bg-status-active/10 text-status-active",
  reconnecting: "border-status-idle/40 bg-status-idle/10 text-status-idle",
  disconnected: "border-status-disconnected/40 bg-status-disconnected/10 text-status-disconnected",
};

export function ConnectionBanner({ status, reconnectAttempts }: ConnectionBannerProps) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${STATUS_STYLES[status]}`}>
      상태: {status}
      {status !== "connected" ? ` · 재시도 ${reconnectAttempts}회` : ""}
    </div>
  );
}
