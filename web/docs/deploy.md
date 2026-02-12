# Deployment Scripts

운영 실행 기준:

- 배포 전 체크리스트/장애 대응: `docs/runbook.md`

## 1) Build + Verify

```bash
./scripts/build-prod.sh
```

- `npm ci`
- `npm run verify` (lint + typecheck + test:ci + build)

## 2) Start (Production)

```bash
PORT=3000 HOSTNAME=0.0.0.0 ./scripts/start-prod.sh
```

## 3) Healthcheck

```bash
./scripts/healthcheck.sh http://127.0.0.1:3000
```

기본값:
- URL 미지정 시 `http://127.0.0.1:${PORT:-3000}`
- 타임아웃: `TIMEOUT_SECONDS=5`
