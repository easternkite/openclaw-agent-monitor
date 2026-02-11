type RealtimeBadgeStatus = "connected" | "reconnecting" | "disconnected";

type RealtimeBadgeProps = {
  status: RealtimeBadgeStatus;
};

const STATUS_META: Record<
  RealtimeBadgeStatus,
  {
    label: string;
    icon: string;
    tone: string;
  }
> = {
  connected: {
    label: "Connected",
    icon: "●",
    tone: "bg-status-active/10 text-status-active border-status-active/40",
  },
  reconnecting: {
    label: "Reconnecting",
    icon: "◐",
    tone: "bg-status-idle/10 text-status-idle border-status-idle/40",
  },
  disconnected: {
    label: "Disconnected",
    icon: "○",
    tone: "bg-status-disconnected/10 text-status-disconnected border-status-disconnected/40",
  },
};

export function RealtimeBadge({ status }: RealtimeBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.tone}`}
      aria-live="polite"
    >
      <span aria-hidden>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}
