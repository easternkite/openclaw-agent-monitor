export const queryKeys = {
  sessions: {
    all: ["sessions"] as const,
    list: () => [...queryKeys.sessions.all, "list"] as const,
    detail: (sessionKey: string) => [...queryKeys.sessions.all, "detail", sessionKey] as const,
    status: (sessionKey: string) => [...queryKeys.sessions.all, "status", sessionKey] as const,
    history: (sessionKey: string, limit = 50, before?: string) =>
      [...queryKeys.sessions.all, "history", sessionKey, { limit, before: before ?? null }] as const,
  },
  gateway: {
    all: ["gateway"] as const,
    health: () => [...queryKeys.gateway.all, "health"] as const,
  },
} as const;
