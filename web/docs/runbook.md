# Pre-deploy Checklist & Runbook

## Pre-deploy Checklist

배포 전에 아래 항목을 순서대로 확인한다.

1. **품질 게이트 통과**
   - `npm run verify`
2. **환경 변수 확인**
   - `.env`에 `OPENCLAW_API_BASE`, `NEXT_PUBLIC_OPENCLAW_WS_URL`, `MASK_SENSITIVE_FIELDS` 설정
3. **운영 스크립트 확인**
   - `npm run deploy:build`
   - `npm run deploy:start`
   - `npm run healthcheck -- http://127.0.0.1:3000`
4. **지표 확인**
   - connection success rate
   - parse error count
   - reconcile drift 발생 여부

## Runtime Monitoring (권장)

- WebSocket 상태가 `connected`로 유지되는지 확인
- 세션 목록 갱신이 30초 내 정상 반영되는지 확인
- 상세 패널(status/history) 요청 실패 시 재시도 동작 확인

## Incident Runbook

### 1) 연결 실패 지속 (`reconnecting` 고착)

1. Gateway endpoint 환경 변수 확인 (`NEXT_PUBLIC_OPENCLAW_WS_URL`)
2. 네트워크 및 Gateway 상태 확인
3. UI에서 수동 재연결 버튼 실행
4. 복구 안 되면 애플리케이션 재시작 (`npm run deploy:start`)

### 2) API parse error 증가

1. BFF 응답 스키마 변경 여부 확인
2. `src/lib/schemas.ts`와 실제 payload diff 확인
3. 안전 파서 fallback 여부 검토
4. 핫픽스 브랜치 생성 후 테스트/배포

### 3) reconcile drift 발생

1. WebSocket reconnect 이후 sessions list invalidate 여부 확인
2. `sessions_list` 응답 정상성 확인
3. 브라우저 새로고침으로 스냅샷 재동기화
4. 지속 시 WS 이벤트 어댑터 로그 추적 후 패치
