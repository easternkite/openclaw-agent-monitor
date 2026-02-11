"use client";

import { useEffect } from "react";

import { useGatewaySocket } from "@/hooks/use-gateway-socket";
import { normalizeGatewayEvent } from "@/lib/gateway-event-adapter";
import { useRealtimeStore } from "@/stores/realtime-store";

export function useRealtimeSync() {
  const applySessionPatch = useRealtimeStore((state) => state.applySessionPatch);
  const removeSession = useRealtimeStore((state) => state.removeSession);
  const setConnectionStatus = useRealtimeStore((state) => state.setConnectionStatus);
  const incrementReconnectAttempts = useRealtimeStore((state) => state.incrementReconnectAttempts);
  const resetReconnectAttempts = useRealtimeStore((state) => state.resetReconnectAttempts);

  const socket = useGatewaySocket({
    autoConnect: true,
    autoReconnect: true,
    onOpen: () => {
      setConnectionStatus("connected");
      resetReconnectAttempts();
    },
    onClose: () => {
      setConnectionStatus("reconnecting");
      incrementReconnectAttempts();
    },
    onEvent: (event) => {
      const normalized = normalizeGatewayEvent(event);
      if (!normalized) {
        return;
      }

      if (normalized.type === "session.deleted") {
        removeSession(normalized.patch.key);
        return;
      }

      applySessionPatch(normalized.patch);
    },
  });

  useEffect(() => {
    if (socket.disconnected) {
      setConnectionStatus("disconnected");
      return;
    }

    if (socket.reconnecting || socket.connecting) {
      setConnectionStatus("reconnecting");
      return;
    }

    if (socket.connected) {
      setConnectionStatus("connected");
    }
  }, [
    setConnectionStatus,
    socket.connected,
    socket.connecting,
    socket.disconnected,
    socket.reconnecting,
  ]);

  return socket;
}
