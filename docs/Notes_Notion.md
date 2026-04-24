# iOS 탄성 스크롤 / 브라우저 UI / 뷰포트 차이 정리

---

## 먼저 한 줄로 정리하면

iOS 계열 브라우저에서는 문서 끝을 넘어 더 끌리는 탄성 스크롤이 있고, 주소창이나 하단 툴바 같은 브라우저 UI가 움직이면서 실제로 보이는 화면과 레이아웃 계산 기준이 달라질 수 있다.  
그래서 `fixed`, `sticky`, 배경색, 높이 계산이 브라우저 상태에 따라 조금씩 다르게 보일 수 있다.

---

## 용어 정리

### 1. Rubber-band scrolling

iPhone에서 문서 최상단이나 최하단에 닿은 뒤에도 화면을 더 끌 수 있는 그 탄성 스크롤을 말한다.  
손을 떼면 원래 자리로 다시 튕겨 돌아오는 느낌까지 포함해서 보통 같이 말한다.

쉽게 말하면 우리가 흔히 말하는 `탄성 스크롤`, `바운스 스크롤`이 이 개념이다.

예를 들면, 페이지 맨 아래까지 내려간 뒤에도 손가락으로 계속 아래로 당기면 화면이 잠깐 더 늘어났다가 돌아오는데, 그 동작이 바로 여기에 해당한다.

### 2. Overscroll

스크롤 가능한 문서 경계를 넘어 추가 스크롤 입력이 들어가는 상태 전체를 뜻한다.  
`rubber-band`는 iOS에서 이 overscroll이 눈에 보이게 드러나는 대표적인 형태라고 보면 된다.

말 그대로 경계를 넘겨 스크롤하는 상태 자체를 설명하는 말에 가깝다.

예를 들면, 문서 최상단에 이미 도달했는데도 위로 한 번 더 끌어올리는 순간이 overscroll 상태다. 그 다음에 화면이 튕겨 보이는 건 그 overscroll이 시각적으로 드러난 결과다.

### 3. Bounce effect / Scroll bounce

overscroll이 발생했을 때 화면이 늘어나거나 튕겨 보이는 시각적 효과를 말한다.  
실무에서는 `러버밴드`, `바운스`, `오버스크롤 바운스`를 비슷한 맥락으로 섞어서 쓰는 경우도 많다.

즉 overscroll이 "상태"에 더 가깝다면, bounce는 그 상태가 눈에 보이는 방식이라고 보면 이해가 쉽다.

예를 들면, 맨 아래에서 더 당겼을 때 화면이 아래로 살짝 끌려 내려오고 손을 떼면 복원되는 그 움직임 자체를 bounce effect라고 볼 수 있다.

### 4. Browser chrome

웹페이지 바깥에 있는 브라우저 UI 전체를 말한다.  
주소창, 하단 툴바, 뒤로가기 버튼, 탭 영역 같은 것들이 여기에 포함된다.

여기서 `chrome`은 구글 크롬 브라우저를 뜻하는 게 아니라, 브라우저의 외곽 UI라는 의미다.

예를 들면, iPhone Chrome에서 주소창이 위에 있거나 아래에 있는 상태, Safari에서 상단 주소창이 접히고 펼쳐지는 상태 변화는 모두 browser chrome 변화로 볼 수 있다.

### 5. Visual viewport

지금 사용자가 실제로 보고 있는 화면 영역이다.  
모바일에서는 주소창이 접히거나 펼쳐질 때 이 영역이 계속 변할 수 있다.

그래서 iPhone에서 브라우저 UI 위치가 바뀔 때 `fixed` 요소가 어색하게 보이는 문제와 자주 연결된다.

`vh`, `svh`, `dvh` 같은 단위도 결국 이 "지금 보이는 화면"과 어떤 관계를 가지느냐를 이해할 때 같이 보게 된다.

예를 들면, 주소창이 커져서 화면을 더 가리면 사용자가 실제로 볼 수 있는 영역은 줄어든다. 이때 같은 `fixed` 헤더라도 체감상 더 내려와 보이거나 가려져 보일 수 있는데, 그 차이를 설명할 때 visual viewport 개념이 필요하다.

### 6. Layout viewport

CSS 레이아웃 계산의 기준이 되는 뷰포트다.  
이 값은 `visual viewport`와 항상 같지 않다.

iOS 계열 브라우저에서 `fixed`, `sticky`, `100vh`가 기대와 다르게 보이는 이유를 설명할 때 거의 항상 같이 나오는 개념이다.

여기서 자주 헷갈리는 게 있는데, 어떤 요소가 `header`를 기준으로 `absolute` 배치되어 있다고 해서 그게 viewport 기준이 되는 건 아니다. 그 경우에는 단순히 `header`가 그 요소의 위치 계산 기준이 되는 것이다. viewport 개념과는 결이 조금 다르다.

예를 들면, `header { position: relative; }` 안에 있는 드롭다운을 `position: absolute; top: 100%;`로 놓으면 그 드롭다운은 `header`를 기준으로 아래에 붙는다. 반면 `position: fixed` 요소는 보통 viewport를 기준으로 붙는다. 이 차이를 설명할 때 레이아웃 뷰포트를 예를 들 수 있음

### 7. Dynamic viewport

브라우저 UI 변화에 따라 뷰포트 높이와 위치가 계속 바뀌는 상태를 말한다.  
모바일 브라우저, 특히 iOS에서 많이 체감된다.

고정된 화면 크기 하나를 기준으로 생각하면 이해가 잘 안 되는 부분들이 있는데, 모바일에서는 그 "화면 크기" 자체가 스크롤 중에 바뀔 수 있다는 점이 핵심이다.

예를 들면, 스크롤을 내릴 때 주소창이 접히면서 콘텐츠가 더 많이 보이기도 하고, 다시 위로 올리면 주소창이 나타나면서 보이는 영역이 줄어들기도 한다. 이런 변화가 dynamic viewport다.

### 8. Safe area

노치, 홈 인디케이터, 브라우저 UI와 겹치지 않도록 고려해야 하는 안전 영역이다.  
CSS에서는 `env(safe-area-inset-top)` 같은 값으로 다룬다.

기기마다 화면 가장자리 구조가 다르기 때문에, 상단이나 하단에 딱 붙는 UI를 만들 때는 이 영역을 같이 고려해야 자연스럽다.

예를 들면, iPhone에서 화면 최상단에 고정 헤더를 둘 때 `safe-area-inset-top`을 고려하지 않으면 노치와 겹치거나 너무 위에 붙어 보일 수 있다.

---

## 오늘 본 현상을 이 용어들로 다시 말하면

### 상단이나 하단에서 더 끌리는 현상

- `rubber-band scrolling`
- 또는 더 넓게 말하면 `overscroll`

### 주소창이 위에 있냐 아래에 있냐에 따라 레이아웃이 다르게 보이는 현상

- `browser chrome` 변화에 따른 `visual viewport` 변화
- 또는 `visual viewport`와 `layout viewport`가 완전히 같지 않아서 생기는 차이

### fixed / sticky 요소가 브라우저 UI 위치에 따라 다르게 보이는 현상

- 실제로 보이는 화면 기준과 레이아웃 계산 기준이 어긋나면서 생기는 문제
- iOS WebKit 계열 브라우저에서 자주 겪는 이슈

### 하단 탄성 스크롤 때 바탕색이 다르게 보이는 현상

- `overscroll` 구간에서 루트 배경이 드러나는 현상
- 그래서 `html`, `body`, `footer` 배경을 어떻게 나누느냐가 꽤 중요해진다

---

## 실무에서 자주 쓰는 표현

- `iOS rubber-band scrolling`
- `overscroll bounce`
- `visual viewport issue`
- `layout viewport mismatch`

---

## 설명할 때 이렇게 말하면 가장 자연스럽다

### 짧게 말하면

iOS 계열 브라우저는 `rubber-band scrolling`과 동적인 브라우저 UI 때문에 `visual viewport`와 `layout viewport`가 달라질 수 있어서, `fixed`나 `sticky` 요소가 브라우저 상태에 따라 다르게 보일 수 있다.

### 조금 더 풀어서 말하면

iPhone 브라우저에서는 상단과 하단에서 `overscroll`이 발생하면 `rubber-band` 형태의 바운스가 나타난다.  
동시에 주소창이나 하단 툴바 같은 `browser chrome`이 움직이면서 `visual viewport`도 계속 변한다.

문제는 문서 레이아웃은 `layout viewport`를 기준으로 계산되는데, 실제 사용자가 보고 있는 영역은 `visual viewport`라는 점이다.  
이 둘이 완전히 같지 않으면 `fixed`, `sticky`, 높이 계산, 배경 노출이 브라우저 상태에 따라 다르게 보일 수 있다.

---

## 이 프로젝트로 비추어 보았을 때

- 최상단/최하단에서 더 끌리던 현상은 `rubber-band scrolling`
- iPhone Chrome에서 주소창 위치에 따라 sticky / fixed가 다르게 보이던 현상은 `visual viewport` 변화 + `layout viewport` 차이
- 하단 탄성 스크롤 때 footer 톤이 더 자연스럽게 보이도록 배경을 조정한 작업은 `overscroll background handling`에 가까운 대응

---

## 마지막으로 가장 기술적으로 정확한 한 문장

오늘 겪은 이슈는  
`iOS rubber-band scrolling`과 `visual viewport / layout viewport mismatch` 때문에 브라우저 UI 상태에 따라 fixed, sticky, overscroll 표현이 달라지는 현상이라고 정리하면 가장 정확하다.
