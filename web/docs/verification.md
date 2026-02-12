# Verification Pipeline

OpenClaw Monitor web app 검증 파이프라인:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test:ci`
4. `npm run build`

단일 커맨드:

```bash
npm run verify
```

보안 점검(프로덕션 의존성만, high 이상 실패):

```bash
npm run audit:prod
```

CI/로컬 모두 동일한 기준으로 사용한다.
