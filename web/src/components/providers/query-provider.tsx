"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

const DEFAULT_STALE_TIME_MS = 30_000;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status =
            typeof error === "object" && error !== null && "status" in error
              ? Number((error as { status?: unknown }).status)
              : null;

          if (status !== null && status >= 400 && status < 500) {
            return false;
          }

          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

type QueryProviderProps = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
