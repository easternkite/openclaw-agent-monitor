# OpenClaw 에이전트 실시간 모니터링 대시보드 계획서

## 1. 제품 요구사항 문서 (PRD)

### 1.1 문서 목적
OpenClaw에서 동작 중인 5개 에이전트(`main`, `flask`, `bucket`, `box`, `rescue`)의 현재 작업 상태를 실시간으로 확인할 수 있는 웹 대시보드를 구축한다. 운영자는 한 화면에서 에이전트 상태, 세션 활동, 모델/토큰 사용량, 최근 작업 흐름을 즉시 파악할 수 있어야 한다.

### 1.2 대상 사용자
- 운영자(Ops): 전체 에이전트 상태 감시, 장애/정체 구간 탐지
- 개발자(Dev): 특정 에이전트 세션 추적, 히스토리 확인, 디버깅
- 제품 관리자(PM): 에이전트 리소스 사용 추이 모니터링

### 1.3 문제 정의
- 현재는 세션 상태를 API 단위로 조회해야 해 전체 상태를 한눈에 보기 어렵다.
- 에이전트별 최근 작업/활동 위치(채널, 수신자) 파악이 느리다.
- 실시간 이벤트 변화 감지가 어려워 이슈 대응이 지연된다.

### 1.4 목표 (Goals)
- 5개 핵심 에이전트의 실시간 상태를 단일 대시보드에서 제공
- 상태 변화 발생 후 1~2초 내 UI 반영
- 세션 메타데이터(업데이트 시각, 모델, 토큰)를 카드 기반으로 직관적으로 제공
- 문제 발생 시 특정 세션으로 drill-down 가능

### 1.5 비목표 (Non-goals)
- 에이전트 제어(중지/재시작/명령 전송) 기능은 MVP 범위 제외
- 장기 데이터 웨어하우스/BI 분석(월간 리포트)은 범위 제외
- 복잡한 워크플로우 편집기 제공은 범위 제외

### 1.6 기능 요구사항 (Functional Requirements)

#### FR-1. 에이전트 실시간 상태 카드
- 5개 에이전트 고정 카드 표시
- 카드 항목:
  - 에이전트명
  - 현재 상태(`active`, `idle`, `stale`, `disconnected`)
  - 마지막 업데이트 시각 (`updatedAt`)
  - 모델 (`model`)
  - 컨텍스트/총 토큰 (`contextTokens`, `totalTokens`)
  - 마지막 활동 위치(`lastChannel`, `lastTo`, `lastAccountId`)

#### FR-2. 세션 목록 및 필터링
- `sessions_list` 기반 세션 테이블 제공
- 필터:
  - 에이전트명 필터(main/flask/bucket/box/rescue)
  - 채널 필터(discord/telegram/whatsapp 등)
  - 텍스트 검색(`displayName`, `lastTo`)
- 정렬:
  - 최근 업데이트순(기본)
  - 토큰 사용량순

#### FR-3. 세션 상세 패널
- 세션 클릭 시 우측 패널 또는 모달 표시
- 포함 데이터:
  - `session_status` 요약 카드
  - `sessions_history` 최근 N개 메시지
  - 현재 진행 컨텍스트(가능 시)

#### FR-4. 실시간 업데이트
- OpenClaw Gateway WebSocket(`ws://127.0.0.1:18789`) 연결
- 이벤트 수신 시 해당 세션/에이전트 카드만 부분 갱신
- 연결 상태 UI:
  - connected / reconnecting / disconnected
- 재연결 전략:
  - 지수 백오프(1s, 2s, 4s, max 30s)

#### FR-5. 시각적 피드백
- 상태 변경 시 카드 하이라이트 애니메이션(1~2초)
- stale(예: 60초 이상 갱신 없음) 자동 경고 색상
- disconnected(WS 미연결) 상단 배너 경고

#### FR-6. 초기 로드 + 스냅샷 동기화
- 최초 진입 시 `sessions_list` 스냅샷 로드
- 이후 WebSocket 이벤트 스트림으로 증분 반영
- 이벤트 누락 대비 주기적 동기화(예: 30초 마다 `sessions_list` 재검증)

### 1.7 비기능 요구사항 (Non-Functional Requirements)

#### NFR-1. 성능
- 초기 대시보드 표시: 2초 이내(로컬 네트워크 기준)
- 실시간 이벤트 반영 지연: 평균 1초 이내, P95 2초 이내
- 동시 세션 500개 수준에서 스크롤/필터 60fps에 근접한 UX 유지

#### NFR-2. 안정성/가용성
- WebSocket 단절 시 자동 재연결
- 데이터 소스 불안정 시 마지막 정상 상태 유지 + 오류 표식
- 프론트엔드 크래시 방지를 위한 이벤트 파싱 가드

#### NFR-3. 보안
- OpenClaw Gateway 접근은 내부망/로컬 우선
- 민감 데이터 마스킹 옵션(`lastTo`, `lastAccountId` 부분 마스킹)
- 프로덕션 배포 시 인증(사내 SSO 또는 간단한 보호 게이트) 적용

#### NFR-4. 관측성
- 클라이언트 연결 상태, 이벤트 처리량, 에러율 로깅
- 핵심 UX 메트릭(초기 로드 시간, 이벤트 렌더 지연) 추적

#### NFR-5. 유지보수성
- API 어댑터, 실시간 스트림, UI 레이어를 명확히 분리
- 타입 안정성(TypeScript + 런타임 스키마 검증) 확보

### 1.8 사용자 시나리오

#### 시나리오 A: 운영자 실시간 감시
1. 운영자가 대시보드 접속
2. 5개 에이전트 카드에서 `box`가 stale 경고임을 확인
3. `box` 클릭 후 세션 상세에서 최근 이벤트와 `updatedAt` 확인
4. 담당자에게 즉시 알림 전달

#### 시나리오 B: 개발자 디버깅
1. 개발자가 `flask` 에이전트 필터 적용
2. 특정 세션의 `session_status`와 `sessions_history` 확인
3. 토큰 급증(`totalTokens`) 구간과 최근 메시지 상관관계 분석
4. 프롬프트/툴 체인 개선 포인트 도출

#### 시나리오 C: 연결 장애 대응
1. Gateway WS 단절 발생
2. 상단 배너가 `reconnecting` 상태 표시
3. 재연결 성공 후 누락 가능 구간을 `sessions_list` 재동기화로 복구

### 1.9 수용 기준 (Acceptance Criteria)
- 5개 에이전트 상태 카드가 항상 표시된다.
- WebSocket 이벤트 수신 후 대상 카드의 `updatedAt`/상태가 2초 내 반영된다.
- 세션 클릭 시 상세 패널에서 `session_status`와 `sessions_history`가 조회된다.
- WS 단절 후 자동 재연결이 동작하고, 실패 시 사용자에게 명확히 표시된다.

---

## 2. 아키텍처 설계

### 2.1 시스템 구조 다이어그램
```mermaid
flowchart LR
  A[Browser Dashboard\nNext.js Client] -->|HTTP| B[Next.js BFF API]
  A -->|WS (Client Updates)| C[Realtime Hub in Next.js]
  C -->|WS Subscribe| D[OpenClaw Gateway\nws://127.0.0.1:18789]
  B -->|sessions_list/session_status/sessions_history| E[OpenClaw Session APIs]
  C -->|Snapshot Reconcile Trigger| B
```

### 2.2 컴포넌트 구조

#### 프론트엔드(UI)
- `AppShell`: 헤더, 연결 상태 배너, 전체 레이아웃
- `AgentOverviewGrid`: 5개 에이전트 상태 카드
- `SessionTable`: 세션 목록 + 필터/정렬
- `SessionDetailPanel`: 선택 세션 상세 정보
- `RealtimeBadge`: WS 연결 상태 표시

#### 애플리케이션 레이어
- `SessionStore`(클라이언트 상태 저장소)
- `GatewayEventAdapter`(WS 이벤트 정규화)
- `SessionApiClient`(REST 호출)
- `ReconcileWorker`(주기적 스냅샷 재동기화)

#### 서버/BFF 레이어
- `GET /api/sessions`: `sessions_list` 프록시/가공
- `GET /api/sessions/:key/status`: `session_status` 프록시
- `GET /api/sessions/:key/history`: `sessions_history` 프록시
- `GET /api/realtime-token` 또는 내부 라우트: 클라이언트 WS 연결 보호(옵션)

### 2.3 데이터 플로우
1. 초기 진입 시 클라이언트가 `/api/sessions` 요청
2. BFF가 OpenClaw `sessions_list` 조회 후 필요한 필드만 반환
3. 클라이언트는 결과를 `SessionStore`에 저장하고 렌더
4. 동시에 클라이언트(또는 서버 허브)가 Gateway WS 연결
5. 이벤트 수신 시 `GatewayEventAdapter`가 표준 이벤트로 변환
6. `SessionStore`가 영향받는 세션만 업데이트(부분 렌더)
7. 30초 주기로 `/api/sessions` 재호출하여 누락 이벤트 보정

### 2.4 데이터 모델 (권장)
```ts
interface SessionSummary {
  key: string;
  agentName: 'main' | 'flask' | 'bucket' | 'box' | 'rescue' | 'other';
  kind: string;
  channel: string;
  displayName?: string;
  updatedAt: string;
  model?: string;
  contextTokens?: number;
  totalTokens?: number;
  lastChannel?: string;
  lastTo?: string;
  lastAccountId?: string;
  status: 'active' | 'idle' | 'stale' | 'disconnected';
}

interface GatewayEvent {
  type: string;
  sessionKey?: string;
  timestamp: string;
  payload: unknown;
}
```

### 2.5 상태 판정 규칙
- `active`: 최근 10초 이내 업데이트
- `idle`: 10~60초 미만 업데이트 없음
- `stale`: 60초 이상 업데이트 없음
- `disconnected`: Gateway 연결 단절 상태

---

## 3. 기술 스택 선택

### 3.1 선택안
- 프레임워크: **Next.js (App Router, TypeScript)**
- 데이터 페칭/캐시: **TanStack Query**
- 실시간 수신: **Native WebSocket + 커스텀 훅**
- 상태 관리: **Zustand**
- UI: **Tailwind CSS + shadcn/ui**
- 차트/관계 시각화(2단계): **React Flow**
- 런타임 검증: **Zod**

### 3.2 선택 이유
- Next.js:
  - 팀 내 일반적인 생산성과 배포 생태계가 성숙
  - BFF 라우트 구성으로 OpenClaw API 프록시/보안 경계 설정 용이
- TanStack Query:
  - `sessions_list`, `session_status`, `sessions_history` 캐시/동기화에 적합
  - 백그라운드 재검증 및 stale-time 제어가 명확
- Zustand:
  - WS 이벤트 기반 초저지연 부분 업데이트를 가볍게 처리
  - Query 캐시와 충돌 없이 UI 전용 실시간 상태 분리 가능
- Tailwind + shadcn/ui:
  - 빠른 MVP 구현 + 커스터마이징 유연성
- React Flow:
  - Crabwalk 레퍼런스처럼 추후 액션 체인 시각화 확장 용이

### 3.3 대안 비교 (TanStack Start)
- 장점: TanStack 생태계 일관성, 데이터 중심 라우팅 강점
- 단점: 팀 러닝커브/운영 표준화 관점에서 Next.js 대비 초기 진입 장벽 가능
- 결론: 본 프로젝트는 단기간 운영 가시성 확보가 핵심이므로 Next.js 우선 채택

---

## 4. 개발 단계별 계획

### 4.1 MVP 정의 (Phase 1)
- 5개 에이전트 카드 실시간 상태 표시
- 세션 목록 + 기본 필터/정렬
- 세션 상세(`status`, `history`) 조회
- WS 연결 상태 표시 + 자동 재연결
- 30초 주기 스냅샷 재동기화

### 4.2 단계별 일정 (예: 3주)

#### Week 1: 기반 구축
- 프로젝트 스캐폴딩(Next.js + TS + Tailwind)
- OpenClaw API 프록시 라우트 구현
- 세션 데이터 타입/파서(Zod) 구성
- 기본 대시보드 레이아웃 구성

#### Week 2: 실시간/상태관리
- Gateway WS 연결 훅 구현
- 이벤트 정규화 어댑터 + Zustand 스토어 연동
- 에이전트 카드 상태 규칙(active/idle/stale) 적용
- 필터/정렬/검색 기능 구현

#### Week 3: 안정화/운영 준비
- 세션 상세 패널 + history UI 완성
- 장애/재연결/오류 처리 강화
- 성능 튜닝(리렌더 최소화, 가상 스크롤 필요 시 적용)
- QA, 문서화, 배포 스크립트 정리

### 4.3 우선순위 (MoSCoW)
- Must:
  - 5개 에이전트 실시간 카드
  - 세션 목록/상세
  - WS 자동 재연결
- Should:
  - stale 경고, 연결 상태 배너
  - 이벤트 누락 보정 재동기화
- Could:
  - React Flow 기반 액션 그래프
  - 고급 검색(수신자/채널 복합 조건)
- Won't (초기 제외):
  - 에이전트 제어 기능
  - 장기 분석 리포트

### 4.4 리스크 및 대응
- 이벤트 스키마 변동 리스크:
  - 대응: Zod safeParse + unknown 필드 허용 + 경고 로깅
- WS 불안정 리스크:
  - 대응: 지수 백오프 재연결 + 주기적 스냅샷 보정
- 세션 수 증가로 인한 성능 저하:
  - 대응: 부분 업데이트, 메모이제이션, 테이블 가상화

---

## 5. 구현 가이드라인

### 5.1 WebSocket 연결 방법

#### 연결 전략
- 1차 권장: 브라우저에서 Gateway 직접 연결
  - `ws://127.0.0.1:18789` (동일 머신 운영 시)
- 2차 권장: 서버 중계 허브 사용
  - 브라우저는 Next.js에 연결, Next.js가 Gateway와 통신
  - 원격 배포/보안 정책이 있는 환경에서 유리

#### Gateway 이벤트 포맷 구체화
Gateway 원본 이벤트는 아래 구조를 표준 입력으로 본다.

```json
{
  "type": "session.updated",
  "timestamp": "2026-02-11T13:05:21.991Z",
  "key": "workspace:agent:flask:discord:12345",
  "payload": {
    "updatedAt": "2026-02-11T13:05:21.872Z",
    "model": "gpt-5",
    "contextTokens": 14532,
    "totalTokens": 42488,
    "lastChannel": "discord",
    "lastTo": "dev-alerts",
    "lastAccountId": "acc_001"
  }
}
```

처리 대상 이벤트 타입:
- `session.created`: 신규 세션 생성
- `session.updated`: 세션 메타/토큰/최근 활동 변경
- `session.message`: 메시지 단위 이벤트(히스토리 반영)
- `session.deleted`: 세션 종료/정리

세션 키 파싱 규칙:
- `key` 문자열에서 `agent:<name>` 패턴 추출
- 5개 대상(`main`, `flask`, `bucket`, `box`, `rescue`) 외 값은 `other`

```ts
export function parseAgentNameFromKey(
  key: string,
): 'main' | 'flask' | 'bucket' | 'box' | 'rescue' | 'other' {
  const m = key.match(/(?:^|:)agent:([^:]+)/);
  const name = m?.[1];
  if (
    name === 'main' ||
    name === 'flask' ||
    name === 'bucket' ||
    name === 'box' ||
    name === 'rescue'
  ) {
    return name;
  }
  return 'other';
}
```

#### 클라이언트 훅 예시
```ts
import { useEffect, useRef } from 'react';

export function useGatewaySocket(
  onEvent: (evt: unknown) => void,
  onReconnectNeeded: () => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);

  useEffect(() => {
    let closedByUser = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const ws = new WebSocket('ws://127.0.0.1:18789');
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        onReconnectNeeded();
      };

      ws.onmessage = (msg) => {
        try {
          onEvent(JSON.parse(msg.data));
        } catch {
          // 파싱 실패 이벤트는 무시하고 로깅만 수행
        }
      };

      ws.onerror = () => {
        // onclose에서 동일하게 재시도 처리
      };

      ws.onclose = () => {
        if (closedByUser) return;
        const backoff = Math.min(1000 * 2 ** retryRef.current, 30000);
        const jitter = Math.floor(Math.random() * 300);
        retryRef.current += 1;
        timer = setTimeout(connect, backoff + jitter);
      };
    };

    connect();

    return () => {
      closedByUser = true;
      if (timer) clearTimeout(timer);
      wsRef.current?.close();
    };
  }, [onEvent, onReconnectNeeded]);
}
```

### 5.2 OpenClaw API 통합 방법

#### 실제 사용 가능한 OpenClaw 툴
모니터링 MVP에서 사용하는 툴은 아래 3개다.

| tool | 입력 파라미터 | 출력 포맷(핵심) | 사용 지점 |
|---|---|---|---|
| `sessions_list` | `{}` 또는 `{ cursor?: string, limit?: number }` | `{ sessions: SessionListItem[], nextCursor?: string }` | 대시보드 초기 스냅샷/주기 재동기화 |
| `session_status` | `{ key: string }` | `{ key, updatedAt, model, contextTokens, totalTokens, kind, channel, lastChannel, lastTo, lastAccountId }` | 세션 상세 패널 상단 요약 |
| `sessions_history` | `{ key: string, limit?: number, before?: string }` | `{ items: HistoryItem[], nextCursor?: string }` | 세션 상세 메시지 타임라인 |

#### BFF 라우트 권장 구조
- `GET /api/sessions`
  - 내부에서 `sessions_list` 호출
  - 에이전트명 파싱(`key`에서 `agent:<name>`) + 상태 계산(active/idle/stale)
- `GET /api/sessions/[key]/status`
  - 내부에서 `session_status` 호출
- `GET /api/sessions/[key]/history?limit=50`
  - 내부에서 `sessions_history` 호출

#### 실제 호출 예시 코드 (TypeScript)
```ts
type OpenClawToolName = 'sessions_list' | 'session_status' | 'sessions_history';

async function callOpenClawTool<TInput extends Record<string, unknown>, TOutput>(
  name: OpenClawToolName,
  input: TInput,
): Promise<TOutput> {
  const res = await fetch('http://127.0.0.1:18789/tools/call', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, input }),
  });

  if (!res.ok) {
    throw new Error(`tool_call_failed:${name}:${res.status}`);
  }
  return (await res.json()) as TOutput;
}

type SessionListItem = {
  key: string;
  updatedAt: string;
  model?: string;
  contextTokens?: number;
  totalTokens?: number;
  lastChannel?: string;
  lastTo?: string;
  lastAccountId?: string;
};

export async function loadFiveAgentsSnapshot() {
  const result = await callOpenClawTool<{}, { sessions: SessionListItem[] }>(
    'sessions_list',
    {},
  );

  const targets = new Set(['main', 'flask', 'bucket', 'box', 'rescue']);
  const byAgent: Record<string, SessionListItem | undefined> = {};

  for (const s of result.sessions) {
    const agent = parseAgentNameFromKey(s.key);
    if (!targets.has(agent)) continue;

    const prev = byAgent[agent];
    if (!prev || Date.parse(s.updatedAt) > Date.parse(prev.updatedAt)) {
      byAgent[agent] = s;
    }
  }

  return byAgent;
}

export async function loadSessionStatus(key: string) {
  return callOpenClawTool<{ key: string }, Record<string, unknown>>(
    'session_status',
    { key },
  );
}

export async function loadSessionHistory(key: string, limit = 50) {
  return callOpenClawTool<{ key: string; limit: number }, Record<string, unknown>>(
    'sessions_history',
    { key, limit },
  );
}
```

`/tools/call` 경로는 예시다. 실제 경로는 `OPENCLAW_API_BASE` 기준으로 구성한다.

### 5.3 데이터 매핑/상태 관리 패턴

#### 권장 분리
- TanStack Query:
  - 스냅샷 데이터(`sessions_list`, `status`, `history`)
  - 주기 재검증, 캐시 만료 관리
- Zustand:
  - 고빈도 WS 이벤트 기반 즉시 반영 상태
  - 연결 상태(`connected/reconnecting/disconnected`)
  - UI 상호작용 상태(선택 세션, 필터)

#### 데이터 매핑 로직 상세
```ts
type AgentStatus = 'active' | 'idle' | 'stale' | 'disconnected';

export function computeStatus(updatedAt: string, nowMs = Date.now()): AgentStatus {
  const deltaSec = (nowMs - Date.parse(updatedAt)) / 1000;
  if (deltaSec < 10) return 'active';
  if (deltaSec < 60) return 'idle';
  return 'stale';
}

export function formatTokens(contextTokens?: number, totalTokens?: number) {
  const ctx = contextTokens ?? 0;
  const total = totalTokens ?? 0;
  return `${ctx.toLocaleString()} / ${total.toLocaleString()}`;
}

export function mapSessionToCard(
  session: SessionListItem,
  wsConnected: boolean,
) {
  const agentName = parseAgentNameFromKey(session.key);
  const status = wsConnected ? computeStatus(session.updatedAt) : 'disconnected';
  return {
    key: session.key,
    agentName,
    updatedAt: session.updatedAt,
    model: session.model ?? '-',
    tokenLabel: formatTokens(session.contextTokens, session.totalTokens),
    lastChannel: session.lastChannel ?? '-',
    lastTo: session.lastTo ?? '-',
    lastAccountId: session.lastAccountId ?? '-',
    status,
  };
}
```

#### 병합 전략
1. Query 스냅샷 로드
2. WS 이벤트 도착 시 세션별 patch 적용
3. 재동기화 시 서버 스냅샷을 기준으로 drift 교정

#### 불변성/렌더 최적화
- 세션 맵(`Record<key, SessionSummary>`) 기반 patch 업데이트
- selector 구독으로 필요한 컴포넌트만 리렌더
- 테이블 행 컴포넌트 `memo` 적용

### 5.4 에러 처리/재시도 상세

#### API 호출 실패 시나리오
- 네트워크 오류: `fetch failed`, `ECONNREFUSED`, `ETIMEDOUT`
- HTTP 오류: `401/403`(권한), `404`(잘못된 key), `429`(호출 제한), `5xx`(Gateway 장애)
- 스키마 오류: 필수 필드 누락/타입 불일치(Zod parse 실패)

#### API 재시도 로직
- `sessions_list`: 최대 3회 재시도(500ms, 1000ms, 2000ms)
- `session_status`: 최대 2회 재시도
- `sessions_history`: 사용자 액션 기반 조회라 최대 1회 재시도
- `401/403/404`는 즉시 실패, `429/5xx/네트워크`만 재시도

```ts
async function retryable<T>(
  task: () => Promise<T>,
  retries: number,
  baseMs = 500,
) {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await task();
    } catch (err) {
      lastErr = err;
      if (i === retries) break;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
    }
  }
  throw lastErr;
}
```

#### WebSocket 실패 처리
- `onerror` 또는 비정상 `onclose` 발생 시 `reconnecting` 전환
- 지수 백오프 + jitter로 자동 재연결
- 재연결 성공 직후 `sessions_list` 강제 재동기화 1회 실행
- 연속 실패 횟수 임계치(예: 10회) 초과 시 `disconnected` 배너 + 수동 재연결 버튼 노출

### 5.5 테스트 가이드
- 단위 테스트:
  - agentName 파서
  - 상태 판정(active/idle/stale)
  - 이벤트 정규화 함수
- 통합 테스트:
  - `/api/sessions` 응답 매핑
  - WS 이벤트 반영 후 카드 UI 변경
- 수동 점검:
  - Gateway 종료/재시작 시 재연결 동작
  - 대량 이벤트 burst에서 UI 프리즈 여부

### 5.6 운영/배포 체크리스트
- 환경변수
- `OPENCLAW_API_BASE`
  - `OPENCLAW_WS_URL`
  - `MASK_SENSITIVE_FIELDS`
- 헬스체크
  - BFF API 응답 상태
  - WS 연결 성공률
- 로깅
  - reconnect count
  - parse error count
  - snapshot reconcile drift count

---

## 6. 산출물 정의
- `plan.md` (본 문서)
- 구현 시작 시 추가 권장 문서
  - `docs/api-contract.md` (OpenClaw 응답 스키마 명세)
  - `docs/state-machine.md` (연결/세션 상태 전이 규칙)
  - `docs/runbook.md` (운영 장애 대응 절차)
