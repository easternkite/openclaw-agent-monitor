"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { GatewayEvent } from "@/types";

type GatewaySocketOptions = {
  url?: string;
  autoConnect?: boolean;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onEvent?: (event: GatewayEvent) => void;
  onParseError?: (raw: string, error: Error) => void;
};

type GatewaySocketState = {
  connected: boolean;
  connecting: boolean;
  lastMessageAt: string | null;
  connect: () => void;
  disconnect: () => void;
};

function safeParseGatewayEvent(raw: string): GatewayEvent | null {
  try {
    return JSON.parse(raw) as GatewayEvent;
  } catch {
    return null;
  }
}

export function useGatewaySocket(options: GatewaySocketOptions = {}): GatewaySocketState {
  const {
    url = process.env.NEXT_PUBLIC_OPENCLAW_WS_URL ?? "ws://localhost:4110/gateway/events",
    autoConnect = true,
    onOpen,
    onClose,
    onEvent,
    onParseError,
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.close();
    socketRef.current = null;
    setConnected(false);
    setConnecting(false);
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current || !url) return;

    setConnecting(true);
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setConnecting(false);
      onOpen?.();
    };

    socket.onmessage = (message) => {
      const raw =
        typeof message.data === "string"
          ? message.data
          : message.data instanceof Blob
            ? ""
            : String(message.data);

      const parsed = safeParseGatewayEvent(raw);
      if (!parsed) {
        onParseError?.(raw, new Error("Invalid gateway payload"));
        return;
      }

      setLastMessageAt(new Date().toISOString());
      onEvent?.(parsed);
    };

    socket.onclose = (event) => {
      setConnected(false);
      setConnecting(false);
      socketRef.current = null;
      onClose?.(event);
    };

    socket.onerror = () => {
      setConnected(false);
    };
  }, [onClose, onEvent, onOpen, onParseError, url]);

  useEffect(() => {
    if (!autoConnect) return;

    const timer = window.setTimeout(() => {
      connect();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connected,
    connecting,
    lastMessageAt,
    connect,
    disconnect,
  };
}
