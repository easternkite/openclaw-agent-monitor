"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiRequestError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import type { SessionHistoryPage, SessionStatus } from "@/types";

type StatusResponse = {
  status: SessionStatus;
};

async function fetchSessionStatus(sessionKey: string): Promise<SessionStatus> {
  const response = await fetch(`/api/sessions/${encodeURIComponent(sessionKey)}/status`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as Partial<StatusResponse> & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new ApiRequestError(payload.error?.message ?? "Failed to fetch session status", {
      status: response.status,
    });
  }

  if (!payload.status) {
    throw new Error("Session status payload missing");
  }

  return payload.status;
}

async function fetchSessionHistory(sessionKey: string): Promise<SessionHistoryPage> {
  const response = await fetch(`/api/sessions/${encodeURIComponent(sessionKey)}/history?limit=30`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as SessionHistoryPage & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new ApiRequestError(payload.error?.message ?? "Failed to fetch session history", {
      status: response.status,
    });
  }

  return payload;
}

export function useSessionDetail(sessionKey: string | null) {
  const statusQuery = useQuery({
    queryKey: sessionKey ? queryKeys.sessions.status(sessionKey) : [...queryKeys.sessions.all, "status", "idle"],
    queryFn: () => fetchSessionStatus(sessionKey as string),
    enabled: Boolean(sessionKey),
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < 2;
    },
  });

  const historyQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.sessions.history(sessionKey, 30)
      : [...queryKeys.sessions.all, "history", "idle"],
    queryFn: () => fetchSessionHistory(sessionKey as string),
    enabled: Boolean(sessionKey),
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && error.status && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < 1;
    },
  });

  return {
    status: statusQuery.data ?? null,
    history: historyQuery.data?.items ?? [],
    isLoading: statusQuery.isLoading || historyQuery.isLoading,
    error: (statusQuery.error as Error | null) ?? (historyQuery.error as Error | null),
  };
}
