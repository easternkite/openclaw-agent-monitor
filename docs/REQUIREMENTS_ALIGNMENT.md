# Requirements ↔ Design Alignment (Task A)

## Scope

This document maps `plan.md` PRD/architecture/guidelines into implementable units and confirms the MVP + non-goals.

## MVP Confirmation

- **Target agents:** `main`, `flask`, `bucket`, `box`, `rescue` (fixed 5 cards)
- **Realtime:** WebSocket-driven partial updates + reconnect + 30s reconcile
- **Detail panel:** session-level `session_status` + `sessions_history`

## Non-goals Confirmation

- Agent control (stop/restart/command) is out of MVP.
- Long-term BI/warehouse analytics is out of MVP.
- Workflow editor is out of MVP.

---

## PRD → Implementation Mapping

| PRD Requirement                                     | Implementation Unit                                   | Primary Files/Modules                                                                                |
| --------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| FR-1 Agent realtime status cards                    | Agent overview UI + status mapping utility            | `components/agent-overview-grid.tsx`, `lib/status.ts`                                                |
| FR-2 Session list/filter/sort                       | Sessions table + filter state + query sync            | `components/session-table.tsx`, `components/session-filters.tsx`, `stores/ui-store.ts`               |
| FR-3 Session detail panel                           | Detail panel + status/history query hooks             | `components/session-detail-panel.tsx`, `hooks/use-session-status.ts`, `hooks/use-session-history.ts` |
| FR-4 Realtime update/reconnect                      | WS hook + adapter + reconnect policy                  | `hooks/use-gateway-socket.ts`, `lib/gateway-event-adapter.ts`                                        |
| FR-5 Visual feedback (highlight/stale/disconnected) | Card animation/state styles + connection badge/banner | `components/realtime-badge.tsx`, `components/connection-banner.tsx`, `styles/globals.css`            |
| FR-6 Initial snapshot + reconcile                   | Sessions query + periodic revalidate + merge pipeline | `hooks/use-sessions-query.ts`, `stores/realtime-store.ts`                                            |

## Architecture → Implementation Mapping

| Architecture Element (`plan.md`)         | Implementation Unit     | Notes                                           |
| ---------------------------------------- | ----------------------- | ----------------------------------------------- |
| Next.js BFF `/api/sessions`              | Route handler           | OpenClaw `sessions_list` proxy + normalization  |
| Next.js BFF `/api/sessions/:key/status`  | Route handler           | Standardized error mapping (401/403/404/5xx)    |
| Next.js BFF `/api/sessions/:key/history` | Route handler           | Pagination guard (`limit`, `before`)            |
| `SessionStore`                           | Zustand slices          | Separate realtime and UI concerns               |
| `GatewayEventAdapter`                    | Adapter utility         | Normalize incoming WS events to canonical types |
| `SessionApiClient`                       | API client utility      | Typed fetch wrappers and error contracts        |
| `ReconcileWorker`                        | Query interval strategy | 30s reconcile to recover missed events          |

## NFR Readiness Checklist (MVP)

- **Performance:** initial render budget 2s target, incremental patching only.
- **Stability:** parse guards for WS payload, safe fallback to last-known state.
- **Security:** optional masking for `lastTo`, `lastAccountId` in BFF.
- **Maintainability:** TypeScript + Zod runtime parsing on external payloads.

## Delivery Order (recommended)

1. Project skeleton + TypeScript/Tailwind/ESLint/Prettier baseline
2. Domain types + Zod schema + API client
3. BFF routes (`sessions`, `status`, `history`)
4. Realtime hook/adapter/reconnect
5. Zustand stores + snapshot/patch merge
6. UI shells (grid/table/detail) + visual feedback
7. Tests + build/runtime validation + env/deploy docs

## Exit Criteria for Task A

- PRD requirements are explicitly mapped to code modules.
- MVP scope and non-goals are unambiguous and documented.
- Sequence is clear enough for execution in small PRs.
