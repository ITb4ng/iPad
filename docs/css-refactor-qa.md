# CSS 리팩토링 QA 기록

> 기준 브랜치: `dev`  
> 검수 범위: CSS 파일 분리, 로드 순서, 주요 상호작용 구간 회귀 리스크 정리

## 목차

- [1. 문제](#1-문제)
- [2. 판단](#2-판단)
- [3. 조치](#3-조치)
- [3.1 파일 역할 분리](#31-파일-역할-분리)
- [3.2 구조 정리 원칙](#32-구조-정리-원칙)
- [4. 검증](#4-검증)
- [5. 현재 리스크](#5-현재-리스크)
- [6. 남은 검증 항목](#6-남은-검증-항목)
- [7. 추후 개선 제안](#7-추후-개선-제안)
- [8. 결론](#8-결론)

## 1. 문제

기존 스타일 구조는 한 파일 안에 전역 레이아웃, 헤더 인터랙션, 모바일 패널, 본문 섹션, detail 보정, footer, motion 대응이 길게 누적된 상태였다. 이 구조는 화면을 빠르게 붙이는 데는 유리했지만, dev 브랜치에서 릴리즈 직전 보정 작업을 진행하는 시점에는 아래 문제가 더 크게 드러났다.

| 문제 | 왜 리스크가 되었는가 |
| --- | --- |
| 유지보수 범위가 넓음 | 작은 수정도 파일 전체 영향 범위를 함께 읽어야 해서 수정 비용이 커졌다. |
| 탐색 비용이 큼 | header, product nav, footer, detail caption 보정이 한 파일에 섞여 있어 필요한 규칙을 찾는 시간이 길어졌다. |
| cascade 충돌 추적이 어려움 | 같은 선택자군이 서로 떨어진 위치에서 다시 override되어, 왜 최종 값이 적용됐는지 확인하는 데 시간이 들었다. |
| header / mobile panel 리스크가 큼 | 상태 클래스와 transition 규칙이 복잡해, unrelated 수정이 열기/닫기 동작까지 흔들 가능성이 있었다. |
| detail section 리스크가 큼 | `figure`, `figcaption`, 위치 보정용 custom property가 민감해 작은 정리도 시각 회귀로 이어질 수 있었다. |

## 2. 판단

릴리즈 브랜치 생성 전 단계에서 CSS를 더 잘게 분해하는 것보다, 위험 구간을 기준으로 역할을 나누고 읽기 순서를 고정하는 편이 더 안전하다고 판단했다.

| 판단 기준 | 이번 리팩토링에서 택한 방향 | 이유 |
| --- | --- | --- |
| 유지보수성 | 전역/본문, header 계열, footer 계열로 분리 | 자주 함께 수정되는 규칙을 묶어 영향 범위를 줄이기 위해서다. |
| 탐색 비용 | 진입점 파일을 3개로 제한 | 새 작업자가 “어디부터 봐야 하는지”를 빠르게 판단할 수 있게 하기 위해서다. |
| cascade 충돌 관리 | HTML 로드 순서를 `main.css → header.css → footer.css`로 고정 | 구조상 뒤에서 덮어써야 하는 header/footer 보정을 예측 가능하게 만들기 위해서다. |
| header / mobile panel 리스크 | JS 상태 클래스가 많은 구간을 `header.css`로 격리 | hover, flyout, fullscreen panel, sticky nav를 별도로 검토할 수 있게 하기 위해서다. |
| detail section 리스크 | detail과 design 섹션은 `main.css`에 유지 | 위치 보정이 민감한 영역을 억지로 더 쪼개면 회귀 위험이 더 커지기 때문이다. |

## 3. 조치

### 3.1 파일 역할 분리

| 파일 | 역할 | 분리 이유 |
| --- | --- | --- |
| [`../styles/main.css`](../styles/main.css) | 공통 토큰, 본문 섹션, design 섹션, detail 섹션, commerce 섹션, responsive override, `prefers-reduced-motion`, keyframes | 본문 흐름과 시각 리듬을 한 파일에서 읽되, detail/design처럼 구조 결합도가 높은 구간을 함께 유지하기 위해서다. |
| [`../styles/header.css`](../styles/header.css) | global header, desktop flyout, mobile fullscreen panel, product navigation, 관련 상태 클래스 | 인터랙션 리스크가 가장 큰 구간을 별도로 검토하고 회귀 범위를 줄이기 위해서다. |
| [`../styles/footer.css`](../styles/footer.css) | footer 전용 스타일, 모바일 아코디언, footer responsive | 문서성 링크와 보조 정보 영역을 본문 스타일과 분리해 override 경로를 단순화하기 위해서다. |

### 3.2 구조 정리 원칙

| 항목 | 적용 내용 | 현재 판단 |
| --- | --- | --- |
| 로드 순서 | `index.html`, `404.html` 모두 `main.css → header.css → footer.css` 순서로 로드 | 구조상 의도는 명확하며 코드 기준으로는 정렬이 맞다. |
| 변수 정리 | 짧은 전역 변수명으로 정리하되 기존 이름은 alias로 유지 | 일괄 rename로 인한 회귀를 피하면서 읽기 난도를 낮췄다. |
| design 섹션 | 별도 파일로 분리하지 않고 `main.css`에 유지 | 카드/비디오/endframe 위치 보정이 많아 추가 분리가 더 위험하다. |
| 주석 정리 | 읽기 어려운 주석, 오래된 흔적성 코드, 중복 세미콜론 정리 | 파일을 읽을 때 실제 유효 규칙만 빠르게 추릴 수 있게 했다. |

## 4. 검증

현재 확인 결과는 “구조 정리는 반영 완료, 시각 회귀 검증은 일부 남음”에 가깝다. 아래 표는 릴리즈 전 확인 항목을 `Pass / Pending / Need Review`로 분류한 것이다.

| 항목 | 근거 | 상태 |
| --- | --- | --- |
| CSS 파일 분리 목적이 문서와 코드 양쪽에서 설명 가능함 | `main`, `header`, `footer` 역할이 분리되어 있고 로드 순서도 명확하다. | Pass |
| `main.css`, `header.css`, `footer.css` 역할 경계가 유지됨 | 파일 구조와 현재 로드 순서가 의도와 일치한다. | Pass |
| header / mobile panel 상태 클래스 연결 보존 | 상태 클래스는 유지했지만 실제 열기/닫기·ESC·curtain 동작은 수동 회귀 검증이 필요하다. | Need Review |
| product navigation sticky / fixed 전환 안정성 | CSS와 JS 결합 구간이라 태블릿·모바일 스크롤 검증이 남아 있다. | Need Review |
| detail section `figure` / `figcaption` 위치 안정성 | 구조는 보존했지만 화면 크기별 위치 오차는 시각 검수 전까지 확정할 수 없다. | Need Review |
| design 섹션 카드, `snipe`, `badge`, 비디오 전환 유지 | 파일 내 주석과 구간 정리는 끝났지만 자산/레이아웃 회귀 검토가 필요하다. | Need Review |
| `prefers-reduced-motion`, `:focus-visible`, skip-link 관련 규칙 유지 | 코드 제거는 없지만 실제 브라우저별 동작 확인은 아직 미완료다. | Pending |
| Desktop / Tablet / Mobile 실기기 시각 검증 기록 | 문서상 체크리스트는 있으나 결과 기록은 아직 없다. | Pending |
| CSS 파일 분리 후 브라우저별 로드 순서 회귀 검증 | HTML 순서는 맞지만 Chrome, Edge, iPhone Safari, iPhone Chrome 검수는 남아 있다. | Pending |

## 5. 현재 리스크

| 리스크 | 왜 남아 있는가 | 릴리즈 전 확인 포인트 |
| --- | --- | --- |
| 로드 순서 의존성 | `header.css`, `footer.css`가 뒤에서 덮는 규칙을 일부 전제로 한다. | HTML에서 파일 순서가 바뀌지 않았는지, Netlify 배포본에서도 동일한지 확인해야 한다. |
| header / mobile panel 회귀 | `aria-expanded`, `aria-hidden`, `inert`, scroll lock, transition cleanup이 함께 얽혀 있다. | 검색/장바구니/메뉴 열기·닫기, ESC, focus return, body scroll lock을 점검해야 한다. |
| detail caption 위치 보정 | `figcaption`과 관련 custom property가 해상도 차이에 민감하다. | 741px~1000px, 740px 이하, Desktop에서 캡션 어긋남이 없는지 확인해야 한다. |
| design 섹션 집중도 | design 관련 스타일이 여전히 `main.css`에 많이 남아 있어 파일 자체는 크다. | 구조 정리 효과는 있으나, 후속 분리 여부는 릴리즈 이후 재평가가 필요하다. |
| 변수 alias 부채 | 이전 변수명을 병행 유지해 단기 안정성은 높였지만 정리 시점이 다시 필요하다. | alias 제거 전 사용처 목록과 치환 기준을 문서화해야 한다. |

## 6. 남은 검증 항목

| 구간 | 확인할 내용 | 우선순위 |
| --- | --- | --- |
| Desktop | header flyout, basket, curtain close, ESC, sticky nav, hero intro, compare 하단 링크 정렬 | 높음 |
| Tablet `741px~1000px` | header 전환 경계, design 카드 배치, detail caption 위치, product nav offset | 높음 |
| Mobile `740px 이하` | fullscreen panel, close button focus-visible, focus trap, body scroll lock, product nav fixed 처리 | 높음 |
| 접근성 | skip-link, keyboard focus ring, reduced motion, panel 상태 속성, programmatic focus | 높음 |
| 배포 환경 | CSS 파일 3종 로드 순서, 캐시된 이전 스타일 혼입 여부 | 중간 |

## 7. 추후 개선 제안

| 제안 | 기대 효과 | 우선순위 |
| --- | --- | --- |
| detail section caption 토큰 문서화 | 위치 보정 규칙을 감각이 아니라 문서 기준으로 다룰 수 있다. | 중간 |
| header 상태 클래스와 패널 상태 전이도 별도 문서화 | CSS/JS 결합 구간을 신규 작업자가 더 빠르게 이해할 수 있다. | 높음 |
| design 섹션 전용 가이드 문서 추가 | `snipe`, `badge`, video mode 규칙을 재사용하기 쉬워진다. | 중간 |
| CSS 변수 alias 정리 계획 수립 | 릴리즈 이후 기술 부채를 안전하게 줄일 수 있다. | 중간 |
| stylelint 또는 최소 lint 규칙 도입 | 중복 선언, 무효 주석, 포맷 편차를 조기에 잡을 수 있다. | 낮음 |

## 8. 결론

이번 CSS 리팩토링은 “더 예쁘게 나누기”보다 “릴리즈 직전에도 설명 가능하고 회귀 범위를 통제할 수 있게 만들기”에 목적이 있었다. 현재 dev 기준으로 구조적 요구사항은 충족하지만, header/mobile panel/detail section처럼 결합도가 높은 구간은 브라우저 검증이 끝나기 전까지 완료로 보기 어렵다.
