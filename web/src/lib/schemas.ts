import { z } from "zod";

import type { GatewayEvent, SessionHistoryPage, SessionStatus, SessionSummary } from "@/types";

export const sessionLifecycleStatusSchema = z.enum(["active", "idle", "stale", "disconnected"]);

export const sessionSummarySchema = z.object({
  key: z.string(),
  displayName: z.string(),
  agentName: z.string(),
  channel: z.string().nullable(),
  status: sessionLifecycleStatusSchema,
  updatedAt: z.string(),
  lastMessageAt: z.string().nullable(),
  totalTokens: z.number().int().nonnegative().nullable(),
  lastTo: z.string().nullable(),
});

export const sessionsListSchema = z.array(sessionSummarySchema);

export const sessionStatusSchema = z.object({
  key: z.string(),
  model: z.string().nullable(),
  reasoningEnabled: z.boolean(),
  elapsedMs: z.number().nonnegative().nullable(),
  totalTokens: z.number().int().nonnegative().nullable(),
  promptTokens: z.number().int().nonnegative().nullable(),
  completionTokens: z.number().int().nonnegative().nullable(),
  costUsd: z.number().nonnegative().nullable(),
  updatedAt: z.string().nullable(),
});

export const historyRoleSchema = z.enum(["system", "user", "assistant", "tool"]);

export const historyItemSchema = z.object({
  id: z.string(),
  role: historyRoleSchema,
  text: z.string(),
  createdAt: z.string(),
  toolName: z.string().optional(),
});

export const sessionHistoryPageSchema = z.object({
  items: z.array(historyItemSchema),
  nextBefore: z.string().nullable(),
});

export const gatewayEventTypeSchema = z.enum([
  "session.created",
  "session.updated",
  "session.message",
  "session.deleted",
  "gateway.connected",
  "gateway.disconnected",
  "gateway.reconnecting",
]);

export const gatewayEventSchema = z.object({
  id: z.string(),
  type: gatewayEventTypeSchema,
  at: z.string(),
  payload: z.unknown(),
});

export function parseSessionsList(payload: unknown): SessionSummary[] {
  return sessionsListSchema.parse(payload);
}

export function parseSessionStatus(payload: unknown): SessionStatus {
  return sessionStatusSchema.parse(payload);
}

export function parseSessionHistoryPage(payload: unknown): SessionHistoryPage {
  return sessionHistoryPageSchema.parse(payload);
}

export function parseGatewayEvent(payload: unknown): GatewayEvent {
  return gatewayEventSchema.parse(payload);
}

export function safeParseSessionsList(payload: unknown) {
  return sessionsListSchema.safeParse(payload);
}

export function safeParseSessionStatus(payload: unknown) {
  return sessionStatusSchema.safeParse(payload);
}

export function safeParseSessionHistoryPage(payload: unknown) {
  return sessionHistoryPageSchema.safeParse(payload);
}

export function safeParseGatewayEvent(payload: unknown) {
  return gatewayEventSchema.safeParse(payload);
}

export type SessionSummaryInput = z.input<typeof sessionSummarySchema>;
export type SessionStatusInput = z.input<typeof sessionStatusSchema>;
export type HistoryItemInput = z.input<typeof historyItemSchema>;
export type GatewayEventInput = z.input<typeof gatewayEventSchema>;
