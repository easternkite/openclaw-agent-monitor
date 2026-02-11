import { useShallow } from "zustand/react/shallow";

import { useRealtimeStore } from "@/stores/realtime-store";
import { useUiStore } from "@/stores/ui-store";

export function useConnectionStatus() {
  return useRealtimeStore((state) => state.connectionStatus);
}

export function useSessionCount() {
  return useRealtimeStore((state) => Object.keys(state.sessions).length);
}

export function useRealtimeSessionMap() {
  return useRealtimeStore((state) => state.sessions);
}

export function useReconnectAttempts() {
  return useRealtimeStore((state) => state.reconnectAttempts);
}

export function useSelectedSessionKey() {
  return useUiStore((state) => state.selectedSessionKey);
}

export function useSessionFilters() {
  return useUiStore(
    useShallow((state) => ({
      agent: state.filter.agent,
      channel: state.filter.channel,
      query: state.filter.query,
    })),
  );
}
