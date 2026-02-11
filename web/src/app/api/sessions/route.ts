import { NextResponse } from "next/server";
import { z } from "zod";

import { callOpenClawTool } from "@/lib/openclaw-api";
import { mapSessionToSummary, maskSessionSummary } from "@/lib/session-mappers";

const sessionsListItemSchema = z
  .object({
    key: z.string(),
    displayName: z.string().optional(),
    channel: z.string().nullable().optional(),
    updatedAt: z.string().optional(),
    lastMessageAt: z.string().nullable().optional(),
    totalTokens: z.number().int().nonnegative().nullable().optional(),
    lastTo: z.string().nullable().optional(),
  })
  .passthrough();

const sessionsListSchema = z.array(sessionsListItemSchema);

type SessionsListToolResponse = {
  sessions?: unknown;
  items?: unknown;
};

function resolveMaskOption(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  const value = searchParams.get("maskSensitive");

  if (value === null) {
    return process.env.MASK_SENSITIVE_FIELDS === "true";
  }

  return value === "1" || value === "true";
}

export async function GET(request: Request) {
  try {
    const maskSensitive = resolveMaskOption(request);

    const toolResult = await callOpenClawTool<SessionsListToolResponse>({
      tool: "sessions_list",
      input: {
        limit: 200,
      },
    });

    const parsed = sessionsListSchema.parse(toolResult.sessions ?? toolResult.items ?? []);
    const mapped = parsed.map((item) =>
      mapSessionToSummary({
        key: item.key,
        displayName: item.displayName,
        channel: item.channel,
        updatedAt: item.updatedAt,
        lastMessageAt: item.lastMessageAt,
        totalTokens: item.totalTokens,
        lastTo: item.lastTo,
      }),
    );
    const sessions = maskSensitive ? mapped.map(maskSessionSummary) : mapped;

    return NextResponse.json({ sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch sessions";

    return NextResponse.json(
      {
        error: {
          message,
        },
      },
      {
        status: 502,
      },
    );
  }
}
