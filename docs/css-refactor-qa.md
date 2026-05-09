## CSS 리팩토링 QA

### 1. 이번 리팩토링의 목적
- 기존 화면, 반응형 레이아웃, 헤더 동작, 모바일 패널 동작, 스크롤 기반 인터랙션을 유지한 채 CSS 구조를 더 읽기 쉽게 만드는 것이 목적이었다.
- 한 파일에 몰려 있던 역할을 `main.css`, `header.css`, `footer.css`로 나누고, 디자인 섹션은 `main.css`에 유지해 관리 범위를 명확히 했다.
- 변수 이름을 더 짧고 일관된 체계로 정리하되, 기존 변수와 상태 클래스 연결성은 깨지지 않도록 호환 alias를 함께 유지했다.

### 2. 기존 문제점
- 중복 선언: header / product-nav / 모바일 패널 상태 선택자, 공통 패널 배경, border, spacing 규칙이 여러 구간에 반복되어 있었다.
- 섹션 순서 혼재: 하나의 `main.css` 안에 header, footer, detail override, reduced motion, keyframes가 길게 이어져 탐색 비용이 컸다.
- 무효 CSS 및 잔존 코드: 의미가 낮은 주석, 과거 주석 처리 코드, 이중 세미콜론 같은 작은 찌꺼기가 남아 있었다.
- 선택자 과도한 중첩: header 검색/장바구니/모바일 패널 쪽에 동일 상태를 긴 선택자로 반복하는 패턴이 많았다.
- 반응형 override 분산: detail caption 보정과 reduced motion, keyframes가 멀리 떨어져 있어 수정 지점 파악이 어려웠다.
- 헤더/모바일 패널 상태 클래스 복잡도: `is-open`, `is-animating`, `is-closing`, `searching`, `basketing`, `menuing`이 얽힌 규칙이 많아 보수적 접근이 필요했다.
- design/detail section 위치 보정 난이도: `snipe`, `badge`, `video shell`, figcaption 보정값이 민감해 대규모 구조 변경 리스크가 높았다.

### 3. 개선한 내용
- CSS를 아래 역할 기준으로 재정리했다.
- [styles/main.css](/C:/Users/enlea/Desktop/front_end/apple_project_ipad/styles/main.css): 공통, 본문 섹션, 디자인 섹션, detail 섹션, commerce, responsive overrides, reduced motion, keyframes
- [styles/header.css](/C:/Users/enlea/Desktop/front_end/apple_project_ipad/styles/header.css): header, desktop flyout, mobile fullscreen panel, product navigation
- [styles/footer.css](/C:/Users/enlea/Desktop/front_end/apple_project_ipad/styles/footer.css): footer 전용 스타일, footer mobile accordion, footer responsive
- HTML 로드 순서를 `main.css → header.css → footer.css`로 맞춰 cascade 충돌을 최소화했다.
- 디자인 섹션 전용 CSS는 요청 기준에 따라 `main.css`에 그대로 유지했다.
- 반복 전역값을 더 짧은 이름으로 정리했다.
- `--header-h`
- `--panel-h`
- `--nav-h`
- `--page-w`
- `--page-pad`
- `--text`
- `--accent`
- `--line`
- `--surface-section`
- 기존 변수명은 alias로 남겨, 남은 규칙과 JS 훅이 깨지지 않도록 했다.
- 실제 선언부에서는 새 변수명을 우선 사용하도록 치환했다.
- 디자인 섹션의 `snipe`, `badge`, `video shell`, `data-design-video-mode="swap"` 주변에 설명 주석을 보강해 구조를 읽기 쉽게 했다.
- `footer.css`의 깨진 것처럼 보이던 주석과 이중 세미콜론, 주석 처리된 과거 코드 일부를 정리했다.
- 실제 UTF-8 파일 손상 여부를 점검해, 인코딩 문제처럼 보이던 현상이 터미널 출력 문제인지 실제 파일 손상인지 구분했다.

### 4. 보존한 내용
- 대규모 구조 변경을 하지 않은 이유는 header, mobile panel, design, detail caption이 JS 상태 및 위치 보정과 강하게 결합되어 있기 때문이다.
- JS 상태 클래스와 연결된 CSS는 동작 리스크가 커서 클래스명과 상태명 자체를 바꾸지 않았다.
- `is-open`, `is-active`, `is-animating`, `is-closing`, `show`, `hide`, `searching`, `basketing`, `menuing`, `is-mobile-menu-closing`, `is-header-flyout-open`, `is-scroll-hidden`, `is-offset-for-header`, `fixed`, `active`는 그대로 유지했다.
- desktop header flyout 구조, header-flyout-curtain 구조, mobile fullscreen panel 구조는 motion, visibility, pointer-events, transition-delay 의도를 그대로 유지했다.
- product-nav의 sticky / fixed 전환 구조는 그대로 유지했다.
- hero 애니메이션 흐름은 변경하지 않았다.
- 디자인 섹션의 fan, snipe, badge, video / endframe 배치와 `data-design-video-mode="swap"` 로직은 그대로 유지했다.
- detail section의 figure / figcaption 관계와 caption custom property 시스템은 유지하고, 위치값은 보수적으로 다뤘다.
- `prefers-reduced-motion`, `:focus-visible`, skip-link, sr-only, programmatic focus 표시 스타일은 유지했다.

### 5. 테스트 체크리스트
Desktop:
- header search open/close
- header basket open/close
- curtain click close
- ESC close
- scroll 시 header hide/reveal
- product-nav sticky offset
- hero animation
- design section layout
- detail sections figure/caption 위치
- CSS 파일 분리 이후 header.css / footer.css 미로드 이슈가 없는지 확인

Tablet 741px~1000px:
- header desktop/mobile 경계 동작
- product-nav
- design fan/snipe/card 배치
- display/camera/wireless/accessories/ipados/apps/privacy/accessibility 레이아웃

Mobile 740px 이하:
- header tab order: 로고 → 검색 → 장바구니 → 메뉴스타터
- search fullscreen panel
- basket fullscreen panel
- menu fullscreen panel
- close button focus-visible
- focus trap이 JS에서 유지되는지
- body scroll lock
- product-nav fixed 위치
- detail figure/caption 깨짐 여부

Accessibility:
- skip-link 노출
- keyboard focus ring
- prefers-reduced-motion
- aria 상태는 CSS에서 건드리지 않았는지 확인
- programmatic focus 표시 유지 여부 확인

### 6. 리스크
- CSS 파일 분리로 인해 로드 순서가 바뀌면서 미세한 cascade 차이가 생길 수 있다.
- JS 상태 클래스와 CSS 연결성은 여전히 민감하므로 header / mobile panel 동작 검증이 필요하다.
- figcaption 위치값은 작은 순서 변경에도 민감하므로 tablet / mobile 실기기 확인이 필요하다.
- backdrop-filter는 기존 의도를 유지했기 때문에 저사양 환경 성능 리스크가 남아 있다.
- iOS Safari의 `100vh` / `100dvh` 차이로 모바일 패널 체감 높이가 달라질 수 있다.
- 기존 변수 alias를 남겨둔 상태라, 다음 단계에서 alias 제거 전 영향 범위 확인이 필요하다.

### 7. 다음 리팩토링 제안
- detail section caption system을 더 작은 단위 유틸 또는 문서화된 토큰 체계로 분리
- header 상태 클래스와 패널 상태 흐름을 문서로 별도 정리
- 디자인 섹션 토큰과 위치 보정 규칙을 별도 가이드로 정리
- CSS 변수 alias 정리 시점과 제거 기준 수립
- stylelint 도입
- 브라우저별 시각 회귀 체크리스트 문서화
