"use client";

import { useMemo, useState } from "react";

import { mapSessionToCard, sortSessionsByTokens, sortSessionsByUpdatedAt } from "@/lib/session-state-utils";
import { useUiStore } from "@/stores/ui-store";
import type { SessionSummary } from "@/types";

type SessionTableProps = {
  sessions: SessionSummary[];
};

type SortKey = "updatedAt" | "tokens";

export function SessionTable({ sessions }: SessionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const selectSession = useUiStore((state) => state.selectSession);
  const selectedSessionKey = useUiStore((state) => state.selectedSessionKey);

  const sorted = useMemo(() => {
    if (sortKey === "tokens") {
      return sortSessionsByTokens(sessions);
    }

    return sortSessionsByUpdatedAt(sessions);
  }, [sessions, sortKey]);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-3 py-2 text-xs">
        <span className="text-muted-foreground">세션 테이블</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded px-2 py-1 ${sortKey === "updatedAt" ? "bg-background" : "text-muted-foreground"}`}
            onClick={() => setSortKey("updatedAt")}
          >
            업데이트순
          </button>
          <button
            type="button"
            className={`rounded px-2 py-1 ${sortKey === "tokens" ? "bg-background" : "text-muted-foreground"}`}
            onClick={() => setSortKey("tokens")}
          >
            토큰순
          </button>
        </div>
      </div>

      <div className="max-h-72 overflow-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="sticky top-0 bg-surface-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Agent</th>
              <th className="px-3 py-2 text-left">Session</th>
              <th className="px-3 py-2 text-left">Updated</th>
              <th className="px-3 py-2 text-right">Tokens</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr className="border-t border-border/60">
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  조건에 맞는 세션이 없습니다.
                </td>
              </tr>
            ) : (
              sorted.map((session) => {
                const card = mapSessionToCard(session);
                const selected = selectedSessionKey === session.key;

                return (
                  <tr
                    key={session.key}
                    className={`cursor-pointer border-t border-border/60 ${selected ? "bg-status-active/10" : "hover:bg-surface-muted"}`}
                    onClick={() => selectSession(session.key)}
                  >
                    <td className="truncate px-3 py-2">{card.agentName}</td>
                    <td className="truncate px-3 py-2">{card.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{card.updatedAgoLabel}</td>
                    <td className="px-3 py-2 text-right">{card.totalTokensLabel}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
