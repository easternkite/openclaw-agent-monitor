# AGENTS.md

## Project at a glance
- Product: OpenClaw Agent Monitor dashboard
- Goal: real-time status view for 5 agents (`main`, `flask`, `bucket`, `box`, `rescue`)
- Frontend app lives in `web/` (Next.js App Router + TypeScript)

## Quick start
```bash
cd web
npm install
npm run dev
```

## Validation commands
```bash
cd web
npm run lint
npm run build
npm run format:check
```

## Working conventions
- Keep PRs small and single-purpose.
- Prefer type-safe changes (`src/types`, `src/lib/schemas.ts`) before UI wiring.
- Follow existing module split:
  - `src/lib/*` for adapters/utils/api
  - `src/hooks/*` for realtime/query wiring
  - `src/components/session/*` for session UI
- Avoid unrelated refactors during heartbeat tasks.

## Realtime architecture reminders
- Snapshot: query-based load/reconcile
- Streaming: WebSocket patches into Zustand store
- Status model: `active` / `idle` / `stale` / `disconnected`

## PR checklist
- [ ] Scope aligns to one queue item (`OPENCLAW_MONITOR_HEARTBEAT_QUEUE.md`)
- [ ] Lint/build pass locally
- [ ] Branch pushed and PR opened
- [ ] CI checks green
- [ ] PR merged + local `main` synced
- [ ] Queue state + `memory/YYYY-MM-DD.md` updated
