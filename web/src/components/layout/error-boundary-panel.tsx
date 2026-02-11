type ErrorBoundaryPanelProps = {
  message: string | null;
};

export function ErrorBoundaryPanel({ message }: ErrorBoundaryPanelProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-status-disconnected/40 bg-status-disconnected/10 px-3 py-2 text-sm text-status-disconnected">
      오류 감지: {message}
    </div>
  );
}
