import type { HistoryItem } from "@/types";

import type { Edge, Node } from "@xyflow/react";

export type ActionGraphData = {
  nodes: Node[];
  edges: Edge[];
};

const ROLE_COLORS: Record<string, string> = {
  user: "#2563eb",
  assistant: "#16a34a",
  tool: "#7c3aed",
  system: "#6b7280",
};

export function buildActionGraphFromHistory(history: HistoryItem[]): ActionGraphData {
  const nodes: Node[] = history.map((item, index) => {
    const color = ROLE_COLORS[item.role] ?? "#64748b";

    return {
      id: item.id,
      position: { x: 32 + index * 220, y: 36 },
      draggable: false,
      data: {
        label: `${item.role}: ${item.text}`,
      },
      style: {
        width: 200,
        borderRadius: 8,
        border: `1px solid ${color}`,
        background: "#0b1220",
        color: "#e2e8f0",
        fontSize: 12,
        padding: 8,
      },
    };
  });

  const edges: Edge[] = history.slice(1).map((item, index) => ({
    id: `${history[index]?.id}-${item.id}`,
    source: history[index]?.id ?? "",
    target: item.id,
    animated: false,
  }));

  return { nodes, edges };
}
