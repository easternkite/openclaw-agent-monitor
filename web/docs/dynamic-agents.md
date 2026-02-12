# Dynamic Agent Tracking Requirements

## Goal
고정 5카드(`AGENT_SLOTS`) 구조를 동적 에이전트 목록으로 전환한다.

## Scope

### In Scope
1. `sessions_list` 기반으로 현재 활성/최근 세션 에이전트 집합을 동적으로 산출
2. 세션이 없는 에이전트도 레지스트리 소스가 있으면 카드로 노출
3. 카드 정렬 규칙 정의
   - 1순위: active
   - 2순위: idle
   - 3순위: stale
   - 4순위: disconnected / no-session
   - 동순위는 `updatedAt` 내림차순
4. 기존 카드 클릭 → SessionTable 필터 연동 유지

### Out of Scope (이번 단계 제외)
- 조직/권한 단위 visibility 제어
- 사용자 커스텀 정렬/핀 고정
- 다중 워크스페이스 통합

## Status Definitions

- `active`: 최근 이벤트/메시지가 임계값 이내
- `idle`: 연결은 유지되나 최근 활동이 낮음
- `stale`: 일정 시간 이상 업데이트 없음
- `disconnected`: 연결/세션 상태 불명확
- `idle(no-session)`: 레지스트리에는 존재하나 세션 없음

`idle(no-session)`은 UI badge에서 `idle`과 구분 텍스트로 표현한다.

## UI Exposure Rules

1. 기본 화면은 동적으로 계산된 에이전트 전부 노출
2. 세션 없는 에이전트는 하단 우선순위
3. 동일 에이전트가 여러 세션을 가지면 최신 세션 기준 단일 카드만 노출
4. `agentName` 누락 시 `session key` prefix 파싱 fallback 적용

## Acceptance Criteria

- 새 에이전트 세션 유입 시 페이지 리로드 없이 카드가 추가된다.
- 기존 에이전트 세션 종료 시에도 레지스트리 존재 시 카드가 유지된다.
- 세션/레지스트리 모두 사라지면 카드가 제거된다.
- 기존 필터/상세 패널 동작 회귀가 없다.

## Verification Scenarios (AT)

자동 검증은 `src/lib/agent-merge.e2e-scenarios.test.ts`에서 아래 시나리오를 커버한다.

1. 신규 에이전트 세션 유입 시 카드 추가
2. 세션 소멸 후 레지스트리-only 에이전트 카드 유지
3. 세션+레지스트리 모두 사라질 때 카드 제거

실행:

```bash
npm run test:ci
```
