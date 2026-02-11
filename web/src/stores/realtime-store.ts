import { create } from "zustand";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export type RealtimeSessionPatch = {
  key: string;
  updatedAt: string;
  channel?: string | null;
  agentName?: string;
  lastMessageAt?: string;
  lastRole?: "user" | "assistant" | "tool";
};

type RealtimeState = {
  connectionStatus: ConnectionStatus;
  sessions: Record<string, RealtimeSessionPatch>;
  reconnectAttempts: number;
  lastEventAt: string | null;
};

type RealtimeActions = {
  setConnectionStatus: (status: ConnectionStatus) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  applySessionPatch: (patch: RealtimeSessionPatch) => void;
  removeSession: (sessionKey: string) => void;
};

export type RealtimeStore = RealtimeState & RealtimeActions;

export const useRealtimeStore = create<RealtimeStore>((set) => ({
  connectionStatus: "disconnected",
  sessions: {},
  reconnectAttempts: 0,
  lastEventAt: null,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
  applySessionPatch: (patch) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        [patch.key]: {
          ...state.sessions[patch.key],
          ...patch,
        },
      },
      lastEventAt: new Date().toISOString(),
    })),
  removeSession: (sessionKey) =>
    set((state) => {
      if (!(sessionKey in state.sessions)) {
        return state;
      }

      const { [sessionKey]: _removed, ...rest } = state.sessions;

      return {
        sessions: rest,
        lastEventAt: new Date().toISOString(),
      };
    }),
}));
