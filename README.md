# Apple iPad Landing Clone

Apple Korea의 iPad 제품 소개 페이지를 참고해 제작한 정적 프론트엔드 클론 프로젝트입니다.  
화면 구현에 그치지 않고, Apple 스타일의 시각 위계와 Hero 타이포그래피 인터랙션을 구현하면서 퍼블리싱 완성도와 UI 재현 능력을 강화하는 데 초점을 맞췄습니다.

## 프로젝트 개요

- 프로젝트 유형: 정적 웹 퍼블리싱 / 인터랙션 클론
- 구현 범위: Hero 섹션, 제품 소개형 콘텐츠 섹션, 비교 카드, 푸터 내비게이션
- 목표: Apple 스타일 랜딩 페이지의 구조, 타이포그래피, 모션 흐름을 직접 구현하며 퍼블리싱 역량 고도화

## 기술 스택

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![ES6 Modules](https://img.shields.io/badge/ES6%20Modules-323330?style=flat-square&logo=javascript&logoColor=F7DF1E)

프레임워크나 번들러 없이 순수 프론트엔드 기술만으로 화면 구조와 인터랙션을 구현했습니다.

## 실행 방법

이 프로젝트는 정적 파일 기반으로 구성되어 있습니다.  
`js/main.js`가 `type="module"`로 로드되므로, 로컬 파일을 직접 여는 방식보다 간단한 로컬 서버 환경에서 확인하는 것을 권장합니다.

```bash
# VS Code Live Server 사용
```

## 디렉터리 구조

```text
apple_project_ipad/
├─ index.html
├─ styles/
│  ├─ main.css
│  └─ reset.css
├─ data/
│  ├─ ipads.js
│  └─ navigations.js
├─ js/
│  └─ main.js
├─ images/
└─ videos/
```

## 주요 구현 포인트

### 1. Hero 섹션 인터랙션

- `iPad` 타이포의 색상 분리 모션 구현
- 후속 카피(`쓰다. / 그리다. / 빠져들다.`) 전환 로직 구현
- 본문 카피, 하이라이트, 링크의 단계적 노출 구성
- 데스크톱/태블릿/모바일 환경에 따른 반응형 레이아웃 조정

### 2. 데이터 기반 UI 렌더링

- `data/ipads.js`를 기반으로 비교 섹션 카드 렌더링
- `data/navigations.js`를 기반으로 푸터 내비게이션 렌더링
- 반복되는 마크업을 데이터 중심으로 관리해 유지보수성을 높임

### 3. 인터랙션 중심 페이지 구조

- 헤더 검색, 장바구니, 모바일 메뉴 상태 제어
- 섹션 진입 시 정보 블록 reveal 처리
- 비디오 컨트롤 인터랙션 연결

## 주요 파일 설명

### `index.html`

- 페이지 전체 마크업
- Hero, Power, Display, Camera, Accessories, Compare, Footer 등 주요 섹션 구성

### `styles/main.css`

- 전체 레이아웃 및 반응형 스타일
- Hero 섹션 인터랙션 스타일
- 헤더, 내비게이션, 섹션별 비주얼 스타일 관리

### `js/main.js`

- 헤더/검색/모바일 메뉴 상태 제어
- Hero intro interaction 제어
- 비교 섹션 및 푸터 내비게이션 렌더링
- 보조 인터랙션 및 섹션 진입 효과 처리

## 작업 과정

기존 `main` 브랜치 작업물에서는 Apple 공홈과 유사한 방향으로 UI를 구현하기 위해, 적용하고 싶었던 구조와 인터랙션 요소를 AI를 통해 먼저 분석했습니다. 이후 분석 결과를 바탕으로 필요한 표현 방식과 기술 요소를 직접 학습하고 검증하면서 현재 프로젝트에 맞게 재해석하여 반영했습니다.

이후 기존 작업물에서 구조 중복, Hero 섹션 충돌, 한글 인코딩 문제, 내비게이션 인터랙션 오류 등을 확인했고, 이를 안정적으로 개선하기 위해 `dev` 브랜치에서 수정과 리팩토링을 진행한 뒤 `master` 브랜치로 재배포하는 흐름을 계획했습니다. 이 과정에서 단순 구현을 넘어, 퍼블리싱 품질 개선과 브랜치 전략 기반의 작업 관리 방식을 함께 적용했습니다.

이 프로젝트는 단순한 클론 결과물이 아니라,

- UI 재현 능력
- 반응형 대응 역량
- 인터랙션 구현 능력
- 기존 코드 개선 및 리팩토링 경험
- 브랜치 전략을 통한 작업 관리 능력

을 함께 보여주기 위한 포트폴리오 작업물로 정리하고 있습니다.

## 향후 개선 예정

- `href="javascript:void(0)"` 구조 정리
- 시맨틱 마크업 및 heading 위계 개선
- 접근성 속성 보강
- Hero 및 내비게이션 관련 CSS/JS 추가 모듈화
- SEO 및 구조 안정화

## 한 줄 요약

Vanilla JavaScript 기반으로 Apple 스타일 랜딩 페이지의 인터랙션, 상태 제어, 데이터 렌더링, 반응형 UI를 구현하고, 기존 코드의 구조적 문제를 리팩토링하며 개발 역량과 브랜치 전략 기반의 협업 흐름을 함께 보여주는 프로젝트입니다.
