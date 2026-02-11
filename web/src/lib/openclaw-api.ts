import { env } from "@/lib/env";

const OPENCLAW_API_BASE = env.OPENCLAW_API_BASE;

type CallToolRequest<TInput = unknown> = {
  tool: string;
  input?: TInput;
};

type OpenClawApiErrorShape = {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
};

export class OpenClawApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: unknown;

  constructor(message: string, status: number, options?: { code: string | undefined; details: unknown }) {
    super(message);
    this.name = "OpenClawApiError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

function resolveEndpoint(path: string) {
  return new URL(path, OPENCLAW_API_BASE).toString();
}

async function parseJsonSafely(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function ensureError(payload: unknown, status: number): OpenClawApiError {
  const shape = (payload ?? {}) as OpenClawApiErrorShape;
  const message = shape.error?.message ?? `OpenClaw API request failed (${status})`;

  return new OpenClawApiError(message, status, {
    code: shape.error?.code,
    details: shape.error?.details,
  });
}

export async function callOpenClawTool<TOutput = unknown, TInput = unknown>(
  request: CallToolRequest<TInput>,
): Promise<TOutput> {
  const response = await fetch(resolveEndpoint("/tool"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw ensureError(payload, response.status);
  }

  return payload as TOutput;
}

export async function callOpenClawEndpoint<TOutput = unknown>(
  path: string,
  init?: RequestInit,
): Promise<TOutput> {
  const response = await fetch(resolveEndpoint(path), {
    ...init,
    cache: "no-store",
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw ensureError(payload, response.status);
  }

  return payload as TOutput;
}
