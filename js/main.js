import { initCompareSection } from './modules/compare.js'
import { initErrorPage } from './modules/error-page.js'
import { initFooterNavigation } from './modules/footer.js'
import { initGlobalNavigationMenus } from './modules/global-navigation.js'
import { initHeaderAndNavigation } from './modules/header-navigation.js'
import { initHeroIntro } from './modules/hero.js'
import { initIntersectionReveal } from './modules/reveal.js'
import { initDesignVideoTransition, initStageVideoControls } from './modules/videos.js'
import { normalizeProjectAnchors } from './shared/dom.js'

// 1. HTML에 이미 있는 공통 링크를 프로젝트 경로로 정리합니다.
normalizeProjectAnchors()

// 2. JS로 채우는 공통 UI를 먼저 만듭니다.
initGlobalNavigationMenus()
initFooterNavigation()

// 3. header, nav처럼 전체 페이지에서 쓰이는 인터랙션을 연결합니다.
initHeaderAndNavigation()

// 4. 본문 섹션별 인터랙션을 연결합니다.
initIntersectionReveal()
initStageVideoControls()
initDesignVideoTransition()
initCompareSection()

// 5. 404 페이지 전용 링크와 버튼 동작을 마지막에 보정합니다.
initErrorPage()
initHeroIntro()

// 6. JS로 새로 만든 링크까지 한 번 더 정리합니다.
normalizeProjectAnchors()
