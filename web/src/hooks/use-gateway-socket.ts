"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { GatewayEvent } from "@/types";

type GatewaySocketOptions = {
  url?: string;
  autoConnect?: boolean;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onEvent?: (event: GatewayEvent) => void;
  onParseError?: (raw: string, error: Error) => void;
};

type GatewaySocketState = {
  connected: boolean;
  connecting: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  disconnected: boolean;
  lastMessageAt: string | null;
  connect: () => void;
  disconnect: () => void;
  retryNow: () => void;
};

const BASE_RECONNECT_MS = 1_000;
const MAX_RECONNECT_MS = 30_000;

function safeParseGatewayEvent(raw: string): GatewayEvent | null {
  try {
    return JSON.parse(raw) as GatewayEvent;
  } catch {
    return null;
  }
}

function computeBackoffWithJitter(attempt: number): number {
  const exponential = Math.min(MAX_RECONNECT_MS, BASE_RECONNECT_MS * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 400) - 200;
  return Math.max(BASE_RECONNECT_MS, exponential + jitter);
}

export function useGatewaySocket(options: GatewaySocketOptions = {}): GatewaySocketState {
  const {
    url = process.env.NEXT_PUBLIC_OPENCLAW_WS_URL ?? "ws://localhost:4110/gateway/events",
    autoConnect = true,
    autoReconnect = true,
    maxReconnectAttempts = 8,
    onOpen,
    onClose,
    onEvent,
    onParseError,
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const manuallyClosedRef = useRef(false);
  const connectRef = useRef<() => void>(() => {});

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current || !url) return;

    clearReconnectTimer();
    setConnecting(true);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setConnecting(false);
      setReconnecting(false);
      setDisconnected(false);
      setReconnectAttempts(0);
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
      socketRef.current = null;
      setConnected(false);
      setConnecting(false);
      onClose?.(event);

      if (!autoReconnect || manuallyClosedRef.current) {
        return;
      }

      setReconnectAttempts((prev) => {
        const next = prev + 1;

        if (next > maxReconnectAttempts) {
          setReconnecting(false);
          setDisconnected(true);
          return next;
        }

        const delay = computeBackoffWithJitter(next);
        setReconnecting(true);
        reconnectTimerRef.current = window.setTimeout(() => {
          connectRef.current();
        }, delay);

        return next;
      });
    };

    socket.onerror = () => {
      setConnected(false);
    };
  }, [autoReconnect, clearReconnectTimer, maxReconnectAttempts, onClose, onEvent, onOpen, onParseError, url]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    manuallyClosedRef.current = true;
    clearReconnectTimer();

    const socket = socketRef.current;
    if (!socket) {
      setConnected(false);
      setConnecting(false);
      setReconnecting(false);
      return;
    }

    socket.close();
    socketRef.current = null;
    setConnected(false);
    setConnecting(false);
    setReconnecting(false);
  }, [clearReconnectTimer]);

  const retryNow = useCallback(() => {
    manuallyClosedRef.current = false;
    setDisconnected(false);
    setReconnecting(false);
    setReconnectAttempts(0);
    clearReconnectTimer();
    connect();
  }, [clearReconnectTimer, connect]);

  useEffect(() => {
    if (!autoConnect) return;

    manuallyClosedRef.current = false;
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
    reconnecting,
    reconnectAttempts,
    disconnected,
    lastMessageAt,
    connect,
    disconnect,
    retryNow,
  };
}
