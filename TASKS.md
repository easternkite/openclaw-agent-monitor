# OpenClaw 에이전트 실시간 모니터링 대시보드 작업 리스트

| 작업 번호 | 작업 제목 | 구체적인 세부 내용 | 예상 시간 (분) |
|---|---|---|---:|
| 1 | [A] 요구사항-설계 정합성 체크 | `plan.md`의 PRD/아키텍처/가이드라인을 구현 단위로 매핑하고, MVP 범위(5개 에이전트/실시간/상세패널)와 비목표를 확정한다. | 30 |
| 2 | [B] Next.js 프로젝트 생성 | `create-next-app`으로 App Router 기반 프로젝트를 생성하고, 디렉터리 구조(`app`, `components`, `lib`, `stores`, `hooks`, `types`)를 표준화한다. | 20 |
| 3 | [C] TypeScript 설정 고도화 | `tsconfig`의 path alias(`@/*`)를 구성하고 strict 모드, noUncheckedIndexedAccess 등 안전 옵션을 적용한다. | 20 |
| 4 | [D] Tailwind CSS 설정 | Tailwind 초기 설정, 글로벌 스타일, 디자인 토큰(CSS 변수) 및 상태 컬러(active/idle/stale/disconnected) 기준을 정의한다. | 25 |
| 5 | [E] ESLint 설정 | Next.js + TypeScript + import/order + React hooks 규칙을 적용하고 팀 규칙(미사용 변수, any 제한)을 반영한다. | 20 |
| 6 | [F] Prettier 설정 | Prettier 및 eslint-config-prettier를 연결하고 `.prettierrc`, `.prettierignore`를 작성해 코드 포맷 규칙을 고정한다. | 15 |
| 7 | [G] 공통 의존성 설치 | `@tanstack/react-query`, `zustand`, `zod`, `date-fns`, `clsx`, `tailwind-merge` 등 핵심 라이브러리를 설치한다. | 15 |
| 8 | [H] 개발 편의 의존성 설치 | 테스트/품질용 `vitest`, `@testing-library/react`, `msw`, `eslint-plugin-testing-library` 등을 설치한다. | 20 |
| 9 | [I] shadcn/ui 초기화 | `shadcn` 초기화, `components.json` 설정, 기본 컴포넌트(button, card, badge, table, sheet, input, select) 생성한다. | 30 |
| 10 | [J] TanStack Query 기본 설정 | `QueryClientProvider` 구성, 공통 queryKey 규약, 기본 staleTime/retry 전략 및 Devtools(개발 환경만) 설정한다. | 25 |
| 11 | [K] Zustand 기본 설정 | 실시간 이벤트와 UI 상호작용 분리를 위한 스토어 골격(`realtimeStore`, `uiStore`)과 selector 패턴을 만든다. | 25 |
| 12 | [L] OpenClaw API 클라이언트 구현 | `callOpenClawTool` 공통 함수, 타임아웃/에러 래핑, `OPENCLAW_API_BASE` 기반 endpoint를 구현한다. | 35 |
| 13 | [M] 도메인 타입 정의 | `SessionSummary`, `SessionStatus`, `HistoryItem`, `GatewayEvent` 타입 및 enum/status union을 `types`에 정의한다. | 30 |
| 14 | [N] Zod 스키마 및 파서 구현 | `sessions_list`, `session_status`, `sessions_history`, gateway 이벤트 스키마를 작성하고 `safeParse` 기반 가드 처리한다. | 40 |
| 15 | [O] BFF 라우트: `/api/sessions` | sessions_list 프록시, 에이전트명 파싱, 상태 계산(active/idle/stale), 민감정보 마스킹 옵션 처리한다. | 45 |
| 16 | [P] BFF 라우트: `/api/sessions/[key]/status` | 세션 상세 요약 API 프록시 및 에러 코드(401/403/404/5xx) 표준 응답 매핑을 구현한다. | 30 |
| 17 | [Q] BFF 라우트: `/api/sessions/[key]/history` | 히스토리 조회/페이지네이션(limit, before) 처리와 기본 검증을 추가한다. | 30 |
| 18 | [R] Gateway 연결 훅 구현 | `useGatewaySocket` 훅에서 연결/해제/lifecycle(onopen/onmessage/onclose) 및 JSON 파싱 안전 처리를 구현한다. | 45 |
| 19 | [S] 이벤트 어댑터 구현 | 원본 WS 이벤트를 표준 이벤트(`session.created/updated/message/deleted`)로 정규화하고 key 기반 patch 데이터를 만든다. | 40 |
| 20 | [T] 재연결 로직 구현 | 지수 백오프(1s~30s)+jitter, 재연결 횟수 추적, 임계치 초과 시 disconnected 상태 전환 및 수동 재시도 트리거를 구현한다. | 35 |
| 21 | [U] 스냅샷 Query 구현 | 초기 로드용 `useSessionsQuery`, 30초 주기 재검증(reconcile), 에러/로딩 상태 분기를 구현한다. | 35 |
| 22 | [V] 실시간 Zustand 스토어 구현 | WS 이벤트 patch 반영, 세션 맵 불변 업데이트, 연결 상태/선택 세션/필터 상태를 관리한다. | 40 |
| 23 | [W] 상태 매핑 유틸 구현 | `parseAgentNameFromKey`, `computeStatus`, `mapSessionToCard`, 토큰 포맷팅, 정렬/필터 유틸을 작성한다. | 30 |
| 24 | [X] AppShell 레이아웃 구현 | 헤더, 연결 상태 배너, 콘텐츠 2단/반응형 구조를 만들고 글로벌 에러 경계 영역을 배치한다. | 35 |
| 25 | [Y] RealtimeBadge 구현 | connected/reconnecting/disconnected 상태 표시 컴포넌트와 상태별 색상/아이콘/문구를 구현한다. | 20 |
| 26 | [Z] AgentOverviewGrid 구현 | 5개 에이전트 고정 카드 렌더링, stale 하이라이트(1~2초), 최신 업데이트 시각/토큰/활동 위치를 표시한다. | 45 |
| 27 | [AA] SessionTable 구현 | 세션 테이블, 정렬(업데이트/토큰), 가벼운 가상화 또는 메모 최적화, row 클릭 이벤트를 구현한다. | 55 |
| 28 | [AB] 필터/검색 UI 구현 | 에이전트/채널 필터, 텍스트 검색(displayName, lastTo), 조건 조합과 URL 쿼리 동기화를 구현한다. | 35 |
| 29 | [AC] SessionDetailPanel 구현 | 선택 세션의 status 요약 카드, history 타임라인, 로딩/빈 상태/오류 상태 UI를 구현한다. | 50 |
| 30 | [AD] 에이전트 상태 카드 기능 완성 | 카드 클릭 시 세션 리스트/상세 패널 연동, 최신 활동 세션 연결, 상태 변화 애니메이션을 마무리한다. | 35 |
| 31 | [AE] 실시간 업데이트 연동 | Query 스냅샷 + WS patch 병합, reconnect 직후 강제 재동기화, drift 교정 플로우를 연결한다. | 45 |
| 32 | [AF] API 에러 처리 구현 | 재시도 정책(`sessions_list` 3회, `status` 2회, `history` 1회), 에러 타입 분류 및 사용자 메시지를 구현한다. | 35 |
| 33 | [AG] WebSocket 에러 처리 구현 | 비정상 종료 감지, reconnecting 배너, 연속 실패 카운트 및 수동 재연결 버튼 동작을 구현한다. | 30 |
| 34 | [AH] 사용자 에러 표시 UX 구현 | 토스트/인라인 오류/배너 우선순위를 설계하고, 복구 가능한 액션(다시 시도, 새로고침)을 제공한다. | 30 |
| 35 | [AI] 단위 테스트 작성 | 파서/상태 계산/이벤트 어댑터/스토어 patch 함수 테스트를 작성하고 경계값(10초, 60초)을 검증한다. | 60 |
| 36 | [AJ] 통합 테스트 작성 | BFF API 매핑, 세션 클릭 후 상세 조회, WS 이벤트 수신 후 카드 변경 시나리오를 MSW 기반으로 검증한다. | 75 |
| 37 | [AK] 빌드/런타임 검증 | `lint`, `typecheck`, `test`, `build` 파이프라인을 정리하고 실패 케이스를 수정한다. | 40 |
| 38 | [AL] 환경 변수 템플릿 정리 | `.env.example`에 `OPENCLAW_API_BASE`, `OPENCLAW_WS_URL`, `MASK_SENSITIVE_FIELDS`를 문서화한다. | 20 |
| 39 | [AM] 배포 스크립트 작성 | 배포 대상 환경 기준으로 start/build 스크립트, 헬스체크 스크립트, 간단한 운영 실행 명령을 작성한다. | 30 |
| 40 | [AN] 배포 전 체크리스트/런북 작성 | 연결 성공률, parse error, reconcile drift 지표 확인 절차와 장애 대응(runbook) 최소본을 정리한다. | 35 |

## 총 예상 시간
- 총합: **1,505분 (약 25시간 5분)**
- 권장 진행: 5일(하루 5시간) 또는 3주 스프린트(병렬 진행 포함)
