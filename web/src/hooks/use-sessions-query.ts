"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys } from "@/lib/query-keys";
import { useRealtimeStore } from "@/stores/realtime-store";
import type { SessionSummary } from "@/types";

type SessionsResponse = {
  sessions: SessionSummary[];
};

const RECONCILE_INTERVAL_MS = 30_000;

async function fetchSessionsSnapshot(): Promise<SessionSummary[]> {
  const response = await fetch("/api/sessions", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as Partial<SessionsResponse> & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to fetch sessions snapshot");
  }

  return payload.sessions ?? [];
}

export function useSessionsQuery() {
  const reconcileSessionsSnapshot = useRealtimeStore((state) => state.reconcileSessionsSnapshot);

  const query = useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: fetchSessionsSnapshot,
    refetchInterval: RECONCILE_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    reconcileSessionsSnapshot(
      query.data.map((session) => ({
        key: session.key,
        updatedAt: session.updatedAt,
        channel: session.channel,
        agentName: session.agentName,
        ...(session.lastMessageAt ? { lastMessageAt: session.lastMessageAt } : {}),
      })),
    );
  }, [query.data, reconcileSessionsSnapshot]);

  return {
    ...query,
    sessions: query.data ?? [],
    isInitialLoading: query.isLoading,
    isRevalidating: query.isFetching && !query.isLoading,
  };
}
