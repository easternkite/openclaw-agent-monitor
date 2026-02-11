import type { GatewayEvent } from "@/types";

export type NormalizedGatewayEventType =
  | "session.created"
  | "session.updated"
  | "session.message"
  | "session.deleted";

export type SessionPatch = {
  key: string;
  updatedAt: string;
  agentName?: string | undefined;
  channel?: string | null | undefined;
  lastMessageAt?: string | undefined;
  lastRole?: "user" | "assistant" | "tool" | undefined;
};

export type NormalizedGatewayEvent = {
  type: NormalizedGatewayEventType;
  patch: SessionPatch;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function toRole(value: unknown): "user" | "assistant" | "tool" | undefined {
  return value === "user" || value === "assistant" || value === "tool" ? value : undefined;
}

export function normalizeGatewayEvent(event: GatewayEvent): NormalizedGatewayEvent | null {
  const payload = asRecord(event.payload);
  const key = toStringOrUndefined(payload.key);

  if (!key) {
    return null;
  }

  const updatedAt = toStringOrUndefined(payload.updatedAt) ?? event.at;

  switch (event.type) {
    case "session.created":
      return {
        type: "session.created",
        patch: {
          key,
          updatedAt,
          agentName: toStringOrUndefined(payload.agentName),
          channel:
            typeof payload.channel === "string" || payload.channel === null
              ? (payload.channel as string | null)
              : undefined,
        },
      };

    case "session.updated":
      return {
        type: "session.updated",
        patch: {
          key,
          updatedAt,
        },
      };

    case "session.message":
      return {
        type: "session.message",
        patch: {
          key,
          updatedAt,
          lastMessageAt: updatedAt,
          lastRole: toRole(payload.role),
        },
      };

    case "session.deleted":
      return {
        type: "session.deleted",
        patch: {
          key,
          updatedAt,
        },
      };

    default:
      return null;
  }
}
