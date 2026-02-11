export type ApiErrorType = "unauthorized" | "forbidden" | "not-found" | "network" | "server" | "unknown";

export class ApiRequestError extends Error {
  readonly status: number | undefined;
  readonly type: ApiErrorType;
  readonly userMessage: string;

  constructor(message: string, options?: { status?: number; type?: ApiErrorType; userMessage?: string }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status;
    this.type = options?.type ?? classifyApiErrorType(options?.status);
    this.userMessage = options?.userMessage ?? toUserMessage(this.type);
  }
}

export function classifyApiErrorType(status?: number): ApiErrorType {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status !== undefined && status >= 500) return "server";
  if (status !== undefined && status >= 400) return "unknown";
  return "network";
}

export function toUserMessage(type: ApiErrorType): string {
  switch (type) {
    case "unauthorized":
      return "인증이 필요합니다. API 권한을 확인해주세요.";
    case "forbidden":
      return "접근 권한이 없습니다.";
    case "not-found":
      return "요청한 세션을 찾을 수 없습니다.";
    case "server":
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    case "network":
      return "네트워크 연결을 확인해주세요.";
    default:
      return "요청 처리 중 오류가 발생했습니다.";
  }
}
