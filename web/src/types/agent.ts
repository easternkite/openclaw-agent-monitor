export type AgentLifecycleStatus =
  | "active"
  | "idle"
  | "stale"
  | "disconnected"
  | "idle(no-session)";

export type AgentSourceTag = "session" | "registry" | "hybrid";

export type AgentDescriptor = {
  agentKey: string;
  displayName: string;
  state: AgentLifecycleStatus;
  sourceTag: AgentSourceTag;
  updatedAt?: string | undefined;
  channel?: string | null | undefined;
};

export type AgentRegistrySnapshot = {
  generatedAt: string;
  agents: AgentDescriptor[];
};
