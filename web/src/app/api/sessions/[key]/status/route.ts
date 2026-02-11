import { NextResponse } from "next/server";

import { OpenClawApiError, callOpenClawTool } from "@/lib/openclaw-api";
import { parseSessionStatus } from "@/lib/schemas";

type StatusToolResponse = {
  status?: unknown;
  session?: unknown;
  data?: unknown;
};

function toHttpStatus(error: OpenClawApiError): number {
  if (error.status === 401) {
    return 401;
  }

  if (error.status === 403) {
    return 403;
  }

  if (error.status === 404) {
    return 404;
  }

  return 502;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      key: string;
    }>;
  },
) {
  const { key } = await context.params;

  if (!key) {
    return NextResponse.json(
      {
        error: {
          message: "Session key is required",
          code: "BAD_REQUEST",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await callOpenClawTool<StatusToolResponse>({
      tool: "session_status",
      input: {
        sessionKey: key,
      },
    });

    const status = parseSessionStatus(result.status ?? result.session ?? result.data ?? result);

    return NextResponse.json({ status });
  } catch (error) {
    if (error instanceof OpenClawApiError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: error.code ?? "OPENCLAW_API_ERROR",
          },
        },
        {
          status: toHttpStatus(error),
        },
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
      {
        status: 500,
      },
    );
  }
}
