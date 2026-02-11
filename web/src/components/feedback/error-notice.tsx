"use client";

type ErrorNoticeProps = {
  level: "banner" | "inline";
  message: string;
  onRetry?: () => void;
  onRefresh?: () => void;
};

export function ErrorNotice({ level, message, onRetry, onRefresh }: ErrorNoticeProps) {
  const tone =
    level === "banner"
      ? "border-status-disconnected/50 bg-status-disconnected/10"
      : "border-status-idle/40 bg-status-idle/10";

  return (
    <div className={`rounded-lg border p-3 text-sm ${tone}`}>
      <p className="font-medium text-status-disconnected">오류</p>
      <p className="mt-1 text-foreground">{message}</p>
      <div className="mt-2 flex gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-surface-muted"
          >
            다시 시도
          </button>
        ) : null}
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-surface-muted"
          >
            새로고침
          </button>
        ) : null}
      </div>
    </div>
  );
}
