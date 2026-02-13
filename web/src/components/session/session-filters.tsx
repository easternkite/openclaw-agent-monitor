"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useUiStore } from "@/stores/ui-store";

type SessionFiltersProps = {
  agentOptions: string[];
  channelOptions: string[];
};

export function SessionFilters({ agentOptions, channelOptions }: SessionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useUiStore((state) => state.filter);
  const setAgentFilter = useUiStore((state) => state.setAgentFilter);
  const setChannelFilter = useUiStore((state) => state.setChannelFilter);
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);

  useEffect(() => {
    const agent = searchParams.get("agent");
    const channel = searchParams.get("channel");
    const q = searchParams.get("q");

    setAgentFilter(agent || null);
    setChannelFilter(channel || null);
    setSearchQuery(q || "");
  }, [searchParams, setAgentFilter, setChannelFilter, setSearchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.agent) params.set("agent", filter.agent);
    if (filter.channel) params.set("channel", filter.channel);
    if (filter.query.trim()) params.set("q", filter.query.trim());

    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [filter.agent, filter.channel, filter.query, pathname, router, searchParams]);

  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface-muted p-3 md:grid-cols-3">
      <select
        aria-label="에이전트 필터"
        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        value={filter.agent ?? ""}
        onChange={(event) => setAgentFilter(event.target.value || null)}
      >
        <option value="">모든 에이전트</option>
        {agentOptions.map((agent) => (
          <option key={agent} value={agent}>
            {agent}
          </option>
        ))}
      </select>

      <select
        aria-label="채널 필터"
        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        value={filter.channel ?? ""}
        onChange={(event) => setChannelFilter(event.target.value || null)}
      >
        <option value="">모든 채널</option>
        {channelOptions.map((channel) => (
          <option key={channel} value={channel}>
            {channel}
          </option>
        ))}
      </select>

      <div className="space-y-1">
        <input
          aria-label="세션 검색"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          title="지원 검색: channel:<채널>, to:<수신자>, recipient:<수신자>"
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
          placeholder="검색 (예: channel:discord to:operator incident)"
          value={filter.query}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          지원: channel:&lt;채널&gt;, to:&lt;수신자&gt;, recipient:&lt;수신자&gt; (예: channel:discord to:operator incident)
        </p>
      </div>
    </div>
  );
}
