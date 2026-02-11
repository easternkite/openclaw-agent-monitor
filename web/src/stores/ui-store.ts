import { create } from "zustand";

type SessionFilter = {
  agent: string | null;
  channel: string | null;
  query: string;
};

type UiState = {
  selectedSessionKey: string | null;
  filter: SessionFilter;
  detailPanelOpen: boolean;
};

type UiActions = {
  selectSession: (sessionKey: string | null) => void;
  setAgentFilter: (agent: string | null) => void;
  setChannelFilter: (channel: string | null) => void;
  setSearchQuery: (query: string) => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
};

export type UiStore = UiState & UiActions;

const defaultFilter: SessionFilter = {
  agent: null,
  channel: null,
  query: "",
};

export const useUiStore = create<UiStore>((set) => ({
  selectedSessionKey: null,
  filter: defaultFilter,
  detailPanelOpen: false,
  selectSession: (sessionKey) =>
    set({
      selectedSessionKey: sessionKey,
      detailPanelOpen: Boolean(sessionKey),
    }),
  setAgentFilter: (agent) =>
    set((state) => ({
      filter: {
        ...state.filter,
        agent,
      },
    })),
  setChannelFilter: (channel) =>
    set((state) => ({
      filter: {
        ...state.filter,
        channel,
      },
    })),
  setSearchQuery: (query) =>
    set((state) => ({
      filter: {
        ...state.filter,
        query,
      },
    })),
  openDetailPanel: () => set({ detailPanelOpen: true }),
  closeDetailPanel: () => set({ detailPanelOpen: false }),
}));
