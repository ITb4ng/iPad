# JS 구조 안내

이 폴더는 `main.js`를 시작점으로 사용합니다.  
간단한 수정은 아래 기준으로 파일을 먼저 찾으면 됩니다.

## 시작 파일

- `main.js`: 페이지가 열릴 때 실행할 기능을 순서대로 연결합니다.

## 공통 파일

- `common/config.js`: 메뉴 문구, hero 문구, 경로 변환표, 타이밍 숫자처럼 자주 바뀔 수 있는 설정값을 모아둔 파일입니다.
- `common/dom.js`: 링크 경로 정리, 포커스 확인, 반응형 판단처럼 여러 모듈에서 같이 쓰는 작은 도구 함수 모음입니다.

## 섹션별 파일

- `modules/global-navigation.js`: 전역 메뉴와 모바일 메뉴를 만듭니다.
- `modules/header-navigation.js`: 헤더 검색, 장바구니, 모바일 메뉴, 제품 내비게이션 동작을 관리합니다.
- `modules/hero.js`: hero 섹션의 첫 진입 모션과 문구 주입을 관리합니다.
- `modules/reveal.js`: `.info` 요소가 화면에 들어올 때 `show` 클래스를 붙입니다.
- `modules/videos.js`: design/camera 섹션의 비디오 재생 흐름을 관리합니다.
- `modules/compare.js`: `data/ipads.js` 데이터를 사용해 compare 섹션 상품 카드를 만듭니다.
- `modules/footer.js`: `data/navigations.js` 데이터를 사용해 footer 링크 목록과 모바일 토글을 만듭니다.
- `modules/error-page.js`: 404 페이지의 홈/이전 페이지 링크 흐름을 관리합니다.

## 수정 위치 빠르게 찾기

- 메뉴 수정 `common/config.js`의 `GLOBAL_NAVIGATION_ITEMS`를 수정합니다.
- Hero 전용 문구 수정 `common/config.js`의 `HERO_COPY`를 수정합니다.
- Compare 상품 정보를 바꾸려면 `data/ipads.js`를 수정합니다.
- Footer 링크를 바꾸려면 `data/navigations.js`를 수정합니다.
- 404 버튼 동작을 바꾸려면 `modules/error-page.js`를 수정합니다.
- 비디오 자동 재생 흐름을 바꾸려면 `modules/videos.js`를 수정합니다.
