export type GatewayEventType =
  | "session.created"
  | "session.updated"
  | "session.message"
  | "session.deleted"
  | "gateway.connected"
  | "gateway.disconnected"
  | "gateway.reconnecting";

export type GatewayEvent<TPayload = unknown> = {
  id: string;
  type: GatewayEventType;
  at: string;
  payload: TPayload;
};

export type SessionCreatedEvent = GatewayEvent<{
  key: string;
  agentName: string;
  channel: string | null;
}>;

export type SessionUpdatedEvent = GatewayEvent<{
  key: string;
  updatedAt: string;
  totalTokens: number | null;
}>;

export type SessionMessageEvent = GatewayEvent<{
  key: string;
  role: "user" | "assistant" | "tool";
  text: string;
}>;

export type SessionDeletedEvent = GatewayEvent<{
  key: string;
}>;
