import { describe, expect, it } from "vitest";

import { buildActionGraphFromHistory } from "@/lib/action-graph";
import type { HistoryItem } from "@/types";

describe("buildActionGraphFromHistory", () => {
  it("creates sequential nodes and edges from history", () => {
    const history: HistoryItem[] = [
      { id: "h1", role: "user", text: "hello", createdAt: "2026-02-13T00:00:00.000Z" },
      { id: "h2", role: "assistant", text: "hi", createdAt: "2026-02-13T00:00:01.000Z" },
      { id: "h3", role: "tool", text: "fetched", createdAt: "2026-02-13T00:00:02.000Z" },
    ];

    const graph = buildActionGraphFromHistory(history);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges[0]).toMatchObject({ source: "h1", target: "h2" });
    expect(graph.edges[1]).toMatchObject({ source: "h2", target: "h3" });
  });

  it("returns empty graph for empty history", () => {
    const graph = buildActionGraphFromHistory([]);

    expect(graph.nodes).toHaveLength(0);
    expect(graph.edges).toHaveLength(0);
  });
});
