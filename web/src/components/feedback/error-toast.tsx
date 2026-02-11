"use client";

type ErrorToastProps = {
  message: string | null;
};

export function ErrorToast({ message }: ErrorToastProps) {
  if (!message) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-lg border border-status-disconnected/50 bg-background px-3 py-2 text-sm shadow-lg">
      <p className="text-status-disconnected">{message}</p>
    </div>
  );
}
