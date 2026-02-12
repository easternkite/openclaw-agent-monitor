# Agent Registry Data Source Design

## Objective
동적 에이전트 카드 구성을 위해 **세션 기반 집합(1차)** + **레지스트리 보강(2차)** 전략을 정의한다.

## Source Priority

1. **Primary: `sessions_list` derived set**
   - 현재/최근 세션에서 `agentName`을 수집
   - `agentName`이 없으면 `sessionKey` prefix 파싱 fallback 사용
   - 각 agent의 최신 `updatedAt` 기준으로 대표 세션 결정

2. **Secondary: registry source (optional)**
   - API 제공 시: `/api/agents` 또는 동등 source에서 descriptor 수집
   - API 미제공 시: 정적 설정 fallback (`config/agent-registry.json`)
   - Secondary는 세션이 없는 agent를 보강하기 위한 용도

## Merge Rules

- 키: `agentId` 우선, 없으면 `agentName`
- 결과 상태:
  - 세션 있음: 세션 기반 상태(`active|idle|stale|disconnected`)
  - 세션 없음 + registry 있음: `idle(no-session)`
- 메타 병합:
  - 표시명: registry `displayName` 우선, 없으면 session derived name
  - 채널: 최신 세션 channel
  - sourceTag: `session` | `registry` | `hybrid`

## Freshness & Drift Handling

- `sessions_list` poll(30s) + WS 이벤트 동기화 유지
- reconnect 성공 시 list invalidate로 snapshot 재정렬
- registry는 저빈도(5분) 갱신 또는 앱 시작 시 1회 로드
- registry에서 사라진 agent는 grace window(예: 10분) 후 제거

## Failure Strategy

- Primary 실패 시: 마지막 성공 snapshot 유지 + 오류 배너
- Secondary 실패 시: 세션 기반 카드만 노출(강등 동작)
- 둘 다 실패 시: 빈 상태 + 수동 재시도 액션

## Output Contract (planned)

```ts
type AgentRegistrySnapshot = {
  generatedAt: string;
  agents: Array<{
    agentKey: string;
    displayName: string;
    state: "active" | "idle" | "stale" | "disconnected" | "idle(no-session)";
    sourceTag: "session" | "registry" | "hybrid";
    updatedAt?: string;
  }>;
};
```
