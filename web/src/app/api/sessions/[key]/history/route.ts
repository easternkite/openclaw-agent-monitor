import { NextResponse } from "next/server";

import { OpenClawApiError, callOpenClawTool } from "@/lib/openclaw-api";
import { parseSessionHistoryPage } from "@/lib/schemas";

type HistoryToolResponse = {
  history?: unknown;
  items?: unknown;
  nextBefore?: string | null;
};

function toHttpStatus(error: OpenClawApiError): number {
  if (error.status === 401) return 401;
  if (error.status === 403) return 403;
  if (error.status === 404) return 404;
  return 502;
}

function parseLimit(value: string | null): number {
  if (value === null) return 50;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 200) {
    throw new Error("`limit` must be an integer between 1 and 200");
  }

  return parsed;
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      key: string;
    }>;
  },
) {
  const { key } = await context.params;

  if (!key) {
    return NextResponse.json(
      { error: { message: "Session key is required", code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }

  let limit = 50;
  let before: string | undefined;

  try {
    const { searchParams } = new URL(request.url);
    limit = parseLimit(searchParams.get("limit"));
    const beforeValue = searchParams.get("before");
    before = beforeValue || undefined;
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "Invalid query",
          code: "BAD_REQUEST",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await callOpenClawTool<HistoryToolResponse>({
      tool: "sessions_history",
      input: {
        sessionKey: key,
        limit,
        before,
      },
    });

    const page = parseSessionHistoryPage({
      items: result.history ?? result.items ?? [],
      nextBefore: result.nextBefore ?? null,
    });

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof OpenClawApiError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: error.code ?? "OPENCLAW_API_ERROR",
          },
        },
        { status: toHttpStatus(error) },
      );
    }

    const message = error instanceof Error ? error.message : "Unexpected error";

    return NextResponse.json(
      {
        error: {
          message,
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
