"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, ReactFlow } from "@xyflow/react";

import { buildActionGraphFromHistory } from "@/lib/action-graph";
import type { HistoryItem } from "@/types";

type SessionActionGraphProps = {
  history: HistoryItem[];
};

export function SessionActionGraph({ history }: SessionActionGraphProps) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">그래프에 표시할 액션이 없습니다.</p>;
  }

  const { nodes, edges } = buildActionGraphFromHistory(history.slice(0, 12));

  return (
    <div className="h-56 overflow-hidden rounded-lg border border-border bg-background">
      <ReactFlow fitView nodes={nodes} edges={edges} nodesDraggable={false} nodesConnectable={false} elementsSelectable>
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
