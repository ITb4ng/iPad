import ipads from '../data/ipads.js'
import navigations from '../data/navigations.js'

const BREAKPOINTS = Object.freeze({
  mobile: 740,
  heroMobile: 734
})

const VIEWPORT_EDGE_THRESHOLD = 2

const SEARCH_CONFIG = Object.freeze({
  staggerDuration: 0.4,
  focusDelay: 280
})

const GLOBAL_PANEL_CONFIG = Object.freeze({
  openDuration: 240,
  closeDuration: 240,
  closeCleanupDuration: 290,
  hoverCloseArmDelay: 220,
  autoCloseGuardDuration: 280
})

const MOBILE_MENU_CONFIG = Object.freeze({
  closeCleanupDuration: 320
})

const HEADER_REVEAL_CONFIG = Object.freeze({
  activationOffset: 80,
  hideThreshold: 96,
  revealThreshold: 160,
  transitionDuration: 360
})

const DEBUG = false

const APPLE_BASE_URL = 'https://www.apple.com/kr'
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

const HERO_COPY = Object.freeze({
  words: ['쓰다.', '그리다.', '빠져들다.'],
  subhead: '화면 전체로 즐거운 iPad.',
  description:
    '이제 초고속 A16 칩 탑재. 그 어느 때보다 다재다능한 성능. 시선을 사로잡는 Liquid Retina 디스플레이는 화면 가장자리까지 아름답습니다.',
  highlights: ['27.6cm Liquid Retina 디스플레이', 'A16 칩', '128GB부터 시작'],
  links: ['iPad 11 구입하기', 'AR로 iPad 보기'],
  hardwareAlt: '블루, 핑크, 옐로, 실버 색상의 iPad와 Magic Keyboard Folio',
  hardwareLabels: ['Touch ID', 'A16 칩', '128GB부터']
})

const HERO_TIMING = Object.freeze({
  logoHold: 120,
  logoColorTransition: 120,
  logoSeparateTransition: 380,
  logoSeparateHold: 72,
  logoReturnTransition: 190,
  copyRevealDelay: 52,
  copySettleDuration: 300,
  detailsDelay: 240,
  metaDelay: 140,
  desktop: {
    logoSplit: 64
  },
  mobile: {
    logoSplit: 40
  }
})

const HERO_STATE_CLASSES = [
  'hero--logo-colored',
  'hero--logo-separated',
  'hero--logo-returning',
  'hero--copy-visible',
  'hero--details-visible',
  'hero--meta-visible'
]

const rootEl = document.documentElement
const bodyEl = document.body
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

const isMobileViewport = () => window.innerWidth <= BREAKPOINTS.mobile
const prefersReducedMotion = () => reducedMotionQuery.matches
const getPanelOpenDuration = () => (prefersReducedMotion() ? 20 : GLOBAL_PANEL_CONFIG.openDuration)
const getPanelCloseCleanupDuration = () =>
  prefersReducedMotion() ? 20 : GLOBAL_PANEL_CONFIG.closeCleanupDuration
const getSearchFocusDelay = () => (prefersReducedMotion() ? 0 : SEARCH_CONFIG.focusDelay)

let stableBrowserTopOffset = 0
let hasStableBrowserTopOffset = false

const getBrowserTopOffset = () => Math.round(Math.max(window.visualViewport?.offsetTop ?? 0, 0))

const getViewportHeight = () => window.visualViewport?.height ?? window.innerHeight

const getWindowScrollY = () => Math.max(window.scrollY || window.pageYOffset || 0, 0)

const getDocumentScrollHeight = () =>
  Math.max(
    rootEl.scrollHeight,
    rootEl.offsetHeight,
    document.body?.scrollHeight ?? 0,
    document.body?.offsetHeight ?? 0
  )

const isNearDocumentBottom = () =>
  getDocumentScrollHeight() - (getWindowScrollY() + getViewportHeight()) <= VIEWPORT_EDGE_THRESHOLD

const syncBrowserTopOffset = () => {
  const nextOffset = getBrowserTopOffset()

  if (isMobileViewport() && isNearDocumentBottom() && hasStableBrowserTopOffset) {
    rootEl.style.setProperty('--browser-top-offset', `${stableBrowserTopOffset}px`)
    return
  }

  stableBrowserTopOffset = nextOffset
  hasStableBrowserTopOffset = true
  rootEl.style.setProperty('--browser-top-offset', `${stableBrowserTopOffset}px`)
}

const isFocusableElementVisible = (element) => {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  for (let currentEl = element; currentEl instanceof HTMLElement; currentEl = currentEl.parentElement) {
    if (currentEl.inert || currentEl.getAttribute('aria-hidden') === 'true') {
      return false
    }
  }

  if (element.hidden || element.closest('[hidden]')) {
    return false
  }

  const style = window.getComputedStyle(element)

  if (style.display === 'none' || style.visibility === 'hidden') {
    return false
  }

  return element.getClientRects().length > 0
}

const getNextFocusableElement = (currentElement) => {
  if (!currentElement) {
    return null
  }

  const focusableEls = [...document.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    isFocusableElementVisible
  )
  const currentIndex = focusableEls.indexOf(currentElement)

  if (currentIndex < 0) {
    return null
  }

  return focusableEls[currentIndex + 1] ?? null
}

const toAbsoluteAppleUrl = (url) => {
  if (!url) {
    return '#'
  }

  if (/^https?:\/\//.test(url)) {
    return url
  }

  return `${APPLE_BASE_URL}${url}`
}

const setExpandedState = (element, isExpanded) => {
  if (element) {
    element.setAttribute('aria-expanded', String(isExpanded))
  }
}

const setHiddenState = (element, isHidden) => {
  if (element) {
    element.setAttribute('aria-hidden', String(isHidden))
  }
}

const setText = (element, value) => {
  if (element) {
    element.textContent = value
  }
}

const setTextList = (elements, values) => {
  elements.forEach((element, index) => {
    element.textContent = values[index] ?? ''
  })
}

const setTransitionDelays = (
  elements,
  { reverse = false, duration = SEARCH_CONFIG.staggerDuration } = {}
) => {
  if (!elements.length) {
    return
  }

  const orderedElements = reverse ? [...elements].reverse() : elements

  orderedElements.forEach((element, index) => {
    element.style.transitionDelay = `${(index * duration) / orderedElements.length}s`
  })
}

const initHeaderAndNavigation = () => {
  const headerEl = document.querySelector('header')
  const navEl = document.querySelector('nav.product-nav')

  if (!headerEl || !navEl) {
    return
  }

  const basketStarterEl = headerEl.querySelector('.basket-starter > button')
  const flyoutRootEl = headerEl.querySelector('.header-flyout')
  const basketEl = headerEl.querySelector('#header-basket-flyout')
  const basketPanelInnerEl = basketEl?.querySelector('.basket-panel-inner')
  const basketPanelBarEl = basketEl?.querySelector('.global-mobile-panel__bar')
  const basketPanelBodyEl = basketEl?.querySelector('.global-mobile-panel__body--basket')
  const basketWrapEl = basketEl
  const basketMenuLinkEls = basketEl ? [...basketEl.querySelectorAll('a')] : []
  const headerMenuEls = [...headerEl.querySelectorAll('ul.menu > li')]
  const cloneMenuEl = headerEl.querySelector('#global-mobile-menu')
  const menuMobileCloseEl = cloneMenuEl?.querySelector('[data-mobile-panel-close="menu"]')
  const cloneMenuLinkEls = cloneMenuEl ? [...cloneMenuEl.querySelectorAll('a')] : []
  const searchWrapEl = headerEl.querySelector('.search-wrap')
  const searchPanelEl = searchWrapEl?.querySelector('.search')
  const searchStarterEl = headerEl.querySelector('.search-starter > button')
  const searchCloserEl = searchWrapEl?.querySelector('.search-closer')
  const searchMobileCloseEl = searchWrapEl?.querySelector('[data-mobile-panel-close="search"]')
  const searchResetEl = searchWrapEl?.querySelector('.search-reset')
  const searchInputEl = searchWrapEl?.querySelector('input')
  const searchDelayEls = searchWrapEl ? [...searchWrapEl.querySelectorAll('li')] : []
  const searchQuickLinkEls = searchWrapEl
    ? [...searchWrapEl.querySelectorAll('.autocompletes a')]
    : []
  const basketMobileCloseEl = basketEl?.querySelector('[data-mobile-panel-close="basket"]')
  const mobilePanelCloseEls = [...headerEl.querySelectorAll('[data-mobile-panel-close]')]
  const panelBackdropEl = document.querySelector('[data-panel-backdrop]')
  const panelTriggerEls = [...headerEl.querySelectorAll('[data-panel-trigger]')]
  const globalMenuListEl = headerEl.querySelector('ul.menu')
  const menuStarterEl = headerEl.querySelector('.menu-starter > button')
  const searchTextFieldEl = headerEl.querySelector('.header-search-field')
  const searchCancelEl = headerEl.querySelector('.search-canceler')
  const navMenuToggleEl = navEl.querySelector('.menu-toggler')
  const navMenuShadowEl = navEl.querySelector('.shadow')
  const navMenuEl = navEl.querySelector('#product-nav-menu')
  const skipLinkEl = document.querySelector('.skip-link')
  const mainEl = document.querySelector('main')
  const footerEl = document.querySelector('footer')
  const appContentEls = [skipLinkEl, navEl, mainEl, footerEl].filter(Boolean)
  const headerFocusGuardEls = [globalMenuListEl, flyoutRootEl, cloneMenuEl].filter(Boolean)
  const MOBILE_TRIGGER_LABELS = Object.freeze({
    search: { open: '검색 메뉴 열기', close: '검색 메뉴 닫기' },
    basket: { open: '장바구니 메뉴 열기', close: '장바구니 메뉴 닫기' },
    menu: { open: '전역메뉴 열기', close: '전역메뉴 닫기' }
  })
  const MOBILE_CLOSE_LABELS = Object.freeze({
    search: '검색 메뉴 닫기',
    basket: '장바구니 메뉴 닫기',
    menu: '전역메뉴 닫기'
  })

  let scrollLockY = 0
  let searchFocusTimeoutId = 0
  let activePanelType = null
  // Track the rendered panel separately so close transitions can finish without re-mounting old content.
  let renderedPanelType = null
  let closingPanelType = null
  let lastPanelTriggerEl = null
  let panelHoverCloseTimer = 0
  let panelVisualStateTimeoutId = 0
  let panelHoverArmTimeoutId = 0
  let mobileMenuCloseTimeoutId = 0
  let isPanelHoverCloseArmed = false
  let panelOpenedAt = 0
  let basketOpenMode = null
  let searchOpenMode = null
  let headerMenuOpenMode = null
  let lastScrollY = window.scrollY || window.pageYOffset || 0
  let pendingScrollDelta = 0
  let isHeaderRevealTicking = false
  let isHeaderVisible = true
  let lastScrollDirection = 0
  let scrollIdleTimeoutId = 0
  let mobilePanelFocusTimeoutId = 0
  let mobilePanelFocusRetryTimeoutId = 0
  let mobilePanelFinalFocusTimeoutId = 0
  let mobilePanelFocusRingTimeoutId = 0
  let pendingFocusReturnTimeoutId = 0
  let lastInitialFocusedMobileFlyoutType = null

  /* ==========================================================================
     Search focus modality state
     - 理쒓렐 ?낅젰 ?섎떒???ㅻ낫?쒖씤吏, 留덉슦???곗튂?몄? 異붿쟻
     - ?ㅻ낫?쒕줈 寃?됱갹??吏꾩엯?덉쓣 ?뚮쭔 .is-keyboard-focus ?대옒??遺??
     ========================================================================== */
  let isKeyboardInteraction = false

  const setKeyboardInteraction = () => {
    isKeyboardInteraction = true
  }

  const clearKeyboardInteraction = () => {
    isKeyboardInteraction = false
  }

  const applySearchKeyboardFocusState = () => {
    if (!searchTextFieldEl || !searchInputEl) {
      return
    }

    const isSearchInputFocused = document.activeElement === searchInputEl

    searchTextFieldEl.classList.toggle(
      'is-keyboard-focus',
      isSearchInputFocused && isKeyboardInteraction
    )
  }

  const clearSearchKeyboardFocusState = () => {
    searchTextFieldEl?.classList.remove('is-keyboard-focus')
  }

  const focusSearchInput = () => {
    if (!searchInputEl) {
      return
    }

    searchInputEl.focus()
    applySearchKeyboardFocusState()
  }

  const syncSearchResetState = () => {
    if (!searchInputEl || !searchResetEl) {
      return
    }

    const hasValue = searchInputEl.value.length > 0
    searchResetEl.disabled = !hasValue
    searchResetEl.tabIndex = hasValue ? 0 : -1
    searchResetEl.hidden = !hasValue
    searchResetEl.classList.toggle('is-visible', hasValue)
  }

  const syncBasketPanelHeight = () => {
    if (!basketPanelInnerEl) {
      return
    }

    if (isMobileViewport()) {
      rootEl.style.removeProperty('--basket-panel-height')
      return
    }

    const innerStyles = getComputedStyle(basketPanelInnerEl)
    const paddingTop = parseFloat(innerStyles.paddingTop) || 0
    const paddingBottom = parseFloat(innerStyles.paddingBottom) || 0
    const bodyHeight = basketPanelBodyEl ? Math.ceil(basketPanelBodyEl.scrollHeight) : 0
    const barHeight =
      basketPanelBarEl && getComputedStyle(basketPanelBarEl).display !== 'none'
        ? Math.ceil(basketPanelBarEl.getBoundingClientRect().height)
        : 0
    const nextHeight = Math.max(Math.ceil(bodyHeight + barHeight + paddingTop + paddingBottom), 0)
    rootEl.style.setProperty('--basket-panel-height', `${nextHeight}px`)
  }

  const getPanel = (type) => {
    if (type === 'search') {
      return searchWrapEl
    }

    if (type === 'basket') {
      return basketEl
    }

    return null
  }

  const getPanelContent = (type) => {
    if (type === 'search') {
      return searchPanelEl
    }

    if (type === 'basket') {
      return basketPanelInnerEl
    }

    return null
  }

  const getTrigger = (type) =>
    panelTriggerEls.find((element) => element.dataset.panelTrigger === type) ?? null

  const getTriggerListItem = (type = activePanelType) => getTrigger(type)?.closest('li') ?? null

  const getMobileCloseButton = (type) => {
    if (type === 'menu') {
      return menuMobileCloseEl ?? null
    }

    if (type === 'search') {
      return searchMobileCloseEl ?? null
    }

    if (type === 'basket') {
      return basketMobileCloseEl ?? null
    }

    return null
  }

  const debugFocusState = (label, type) => {
    if (!DEBUG) {
      return
    }

    const closeButtonEl = getMobileCloseButton(type)

    console.log('[mobile-panel-focus]', {
      label,
      type,
      activeElement: document.activeElement,
      closeButton: closeButtonEl,
      isActiveCloseButton: document.activeElement === closeButtonEl,
      mobileFlyoutType: bodyEl?.dataset.mobileFlyout ?? null,
      closeInsideHidden: closeButtonEl?.closest('[hidden]') ?? null,
      closeInsideAriaHidden: closeButtonEl?.closest('[aria-hidden="true"]') ?? null,
      closeInsideInert: closeButtonEl?.closest('[inert]') ?? null
    })
  }

  const getMobilePanelTrigger = (type) => {
    if (type === 'menu') {
      return menuStarterEl ?? null
    }

    return getTrigger(type)
  }

  const isMobilePanelType = (type) => isMobileViewport() && (type === 'search' || type === 'basket')

  const isMobileDialogOpen = (type) => {
    if (!isMobileViewport()) {
      return false
    }

    if (type === 'menu') {
      return headerEl.classList.contains('menuing')
    }

    return activePanelType === type
  }

  const getMobileFlyoutContainer = (type) => {
    if (type === 'menu') {
      return cloneMenuEl ?? null
    }

    if (type === 'search') {
      return searchWrapEl ?? null
    }

    if (type === 'basket') {
      return basketEl ?? null
    }

    return null
  }

  const getMobilePanelFocusables = (type) => {
    const panelEl = getMobileFlyoutContainer(type)

    if (!panelEl) {
      return []
    }

    const closeButtonEl = getMobileCloseButton(type)
    const focusableEls = [...panelEl.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
      isFocusableElementVisible
    )

    if (!(closeButtonEl instanceof HTMLElement) || !focusableEls.includes(closeButtonEl)) {
      return focusableEls
    }

    return [closeButtonEl, ...focusableEls.filter((element) => element !== closeButtonEl)]
  }

  const clearMobilePanelFocusTimer = () => {
    if (mobilePanelFocusTimeoutId) {
      window.clearTimeout(mobilePanelFocusTimeoutId)
      mobilePanelFocusTimeoutId = 0
    }

    if (mobilePanelFocusRetryTimeoutId) {
      window.clearTimeout(mobilePanelFocusRetryTimeoutId)
      mobilePanelFocusRetryTimeoutId = 0
    }

    if (mobilePanelFinalFocusTimeoutId) {
      window.clearTimeout(mobilePanelFinalFocusTimeoutId)
      mobilePanelFinalFocusTimeoutId = 0
    }
  }

  const clearMobilePanelFocusRingTimer = () => {
    if (!mobilePanelFocusRingTimeoutId) {
      return
    }

    window.clearTimeout(mobilePanelFocusRingTimeoutId)
    mobilePanelFocusRingTimeoutId = 0
  }

  const clearProgrammaticCloseButtonFocusState = () => {
    clearMobilePanelFocusRingTimer()
    mobilePanelCloseEls.forEach((element) => {
      element.classList.remove('is-programmatic-focus')
    })
  }

  const applyProgrammaticCloseButtonFocusState = (element) => {
    // Do not keep a fake focus ring after the user tabs away.
    // The real focus outline should come from :focus / :focus-visible only.
    if (!(element instanceof HTMLElement)) {
      return
    }

    clearProgrammaticCloseButtonFocusState()
  }

  const canFocusMobileCloseButton = (type, element) => {
    if (!isMobileDialogOpen(type) || !(element instanceof HTMLElement)) {
      return false
    }

    if (element.disabled || element.closest('[hidden]') || element.closest('[inert]')) {
      return false
    }

    if (element.closest('[aria-hidden="true"]')) {
      return false
    }

    const style = window.getComputedStyle(element)

    return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0
  }

  const focusMobilePanelCloseButton = (type, { preventScroll = true } = {}) => {
    const closeButtonEl = getMobileCloseButton(type)
    const fallbackFocusEl = getMobilePanelFocusables(type)[0] ?? null
    const focusTargetEl = closeButtonEl instanceof HTMLElement ? closeButtonEl : fallbackFocusEl

    if (!(focusTargetEl instanceof HTMLElement) || !canFocusMobileCloseButton(type, focusTargetEl)) {
      return false
    }

    focusTargetEl.focus({ preventScroll })

    const isFocused = document.activeElement === focusTargetEl

    if (isFocused) {
      applyProgrammaticCloseButtonFocusState(focusTargetEl)
    }

    return isFocused
  }

  const queueMobilePanelInitialFocus = (type) => {
    clearMobilePanelFocusTimer()

    const tryFocusCloseButton = (label) => {
      debugFocusState(`${label}-before`, type)
      const isFocused = focusMobilePanelCloseButton(type)
      debugFocusState(`${label}-after`, type)

      if (isFocused) {
        clearMobilePanelFocusTimer()
      }

      return isFocused
    }

    const queueRetryFocus = () => {
      mobilePanelFocusRetryTimeoutId = window.setTimeout(() => {
        mobilePanelFocusRetryTimeoutId = 0

        if (tryFocusCloseButton('retry')) {
          return
        }
      }, prefersReducedMotion() ? 20 : 80)

      mobilePanelFinalFocusTimeoutId = window.setTimeout(() => {
        mobilePanelFinalFocusTimeoutId = 0
        tryFocusCloseButton('final')
      }, getPanelOpenDuration() + 80)
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (tryFocusCloseButton('initial')) {
          return
        }

        queueRetryFocus()
      })
    })
  }

  const trapMobilePanelFocus = (type, event) => {
    if (!isMobileViewport() || event.key !== 'Tab') {
      return false
    }

    const focusableEls = getMobilePanelFocusables(type)

    if (!focusableEls.length) {
      return false
    }

    const firstFocusableEl = focusableEls[0]
    const lastFocusableEl = focusableEls[focusableEls.length - 1]
    const activeEl = document.activeElement
    const isInsidePanel = focusableEls.includes(activeEl)

    if (event.shiftKey) {
      if (activeEl === firstFocusableEl || !isInsidePanel) {
        event.preventDefault()
        lastFocusableEl.focus()
        return true
      }

      return false
    }

    if (activeEl === lastFocusableEl || !isInsidePanel) {
      event.preventDefault()
      firstFocusableEl.focus()
      return true
    }

    return false
  }

  const clearMobileMenuCloseTimer = () => {
    if (!mobileMenuCloseTimeoutId) {
      return
    }

    window.clearTimeout(mobileMenuCloseTimeoutId)
    mobileMenuCloseTimeoutId = 0
  }

  const getActiveMobileFlyoutType = () => {
    if (!isMobileViewport()) {
      return null
    }

    return bodyEl?.dataset.mobileFlyout ?? null
  }

  const setTemporaryAriaHidden = (element, isHidden) => {
    if (!(element instanceof HTMLElement)) {
      return
    }

    if (isHidden) {
      if (!('originalAriaHidden' in element.dataset)) {
        const previousValue = element.getAttribute('aria-hidden')
        element.dataset.originalAriaHidden = previousValue === null ? '__missing__' : previousValue
      }

      element.setAttribute('aria-hidden', 'true')
      return
    }

    if (!('originalAriaHidden' in element.dataset)) {
      return
    }

    const { originalAriaHidden } = element.dataset

    if (originalAriaHidden === '__missing__') {
      element.removeAttribute('aria-hidden')
    } else {
      element.setAttribute('aria-hidden', originalAriaHidden)
    }

    delete element.dataset.originalAriaHidden
  }

  const syncMobileFocusIsolation = ({ mobileFlyoutType = null } = {}) => {
    const isMobileOverlayOpen = isMobileViewport() && Boolean(mobileFlyoutType)

    appContentEls.forEach((element) => {
      element.inert = isMobileOverlayOpen
      setTemporaryAriaHidden(element, isMobileOverlayOpen)
    })

    headerFocusGuardEls.forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return
      }

      const shouldKeepInteractive =
        !isMobileOverlayOpen ||
        (mobileFlyoutType === 'menu' && element === cloneMenuEl) ||
        ((mobileFlyoutType === 'search' || mobileFlyoutType === 'basket') && element === flyoutRootEl)

      element.inert = !shouldKeepInteractive
    })
  }

  const clearPendingFocusReturn = () => {
    if (!pendingFocusReturnTimeoutId) {
      return
    }

    window.clearTimeout(pendingFocusReturnTimeoutId)
    pendingFocusReturnTimeoutId = 0
  }

  const queueFocusReturn = (targetEl, { panelType = null, delay = 0 } = {}) => {
    clearPendingFocusReturn()

    if (!(targetEl instanceof HTMLElement)) {
      return
    }

    const restoreFocus = () => {
      if (panelType && isMobileDialogOpen(panelType)) {
        pendingFocusReturnTimeoutId = 0
        return
      }

      const closingPanelEl = panelType ? getMobileFlyoutContainer(panelType) : null
      const activeEl = document.activeElement
      const shouldRestore =
        !activeEl ||
        activeEl === document.body ||
        activeEl === rootEl ||
        (closingPanelEl instanceof HTMLElement && closingPanelEl.contains(activeEl))

      if (shouldRestore && isFocusableElementVisible(targetEl)) {
        targetEl.focus({ preventScroll: true })
      }

      pendingFocusReturnTimeoutId = 0
    }

    if (!delay) {
      restoreFocus()
      return
    }

    pendingFocusReturnTimeoutId = window.setTimeout(restoreFocus, delay)
  }

  const syncPanelAccessibility = ({
    isSearchOpen = false,
    isBasketOpen = false,
    isHeaderMenuOpen = false,
    isFlyoutOpen = false,
    mobileFlyoutType = null
  } = {}) => {
    const isMobile = isMobileViewport()

    if (searchWrapEl) {
      if (isMobile) {
        searchWrapEl.setAttribute('role', 'dialog')
        searchWrapEl.setAttribute('aria-labelledby', 'header-search-mobile-title')
        searchWrapEl.setAttribute('aria-modal', String(isSearchOpen))
        searchWrapEl.removeAttribute('aria-label')
        searchWrapEl.inert = !isSearchOpen
      } else {
        searchWrapEl.setAttribute('role', 'search')
        searchWrapEl.setAttribute('aria-label', 'apple.com 검색하기')
        searchWrapEl.removeAttribute('aria-labelledby')
        searchWrapEl.removeAttribute('aria-modal')
        searchWrapEl.inert = false
      }
    }

    if (basketEl) {
      if (isMobile) {
        basketEl.setAttribute('role', 'dialog')
        basketEl.setAttribute('aria-modal', String(isBasketOpen))
        basketEl.inert = !isBasketOpen
      } else {
        basketEl.removeAttribute('role')
        basketEl.removeAttribute('aria-modal')
        basketEl.inert = false
      }
    }

    if (cloneMenuEl) {
      if (isMobile) {
        cloneMenuEl.setAttribute('role', 'dialog')
        cloneMenuEl.setAttribute('aria-modal', String(isHeaderMenuOpen))
        cloneMenuEl.inert = !isHeaderMenuOpen
      } else {
        cloneMenuEl.removeAttribute('role')
        cloneMenuEl.removeAttribute('aria-modal')
        cloneMenuEl.inert = false
      }
    }

    flyoutRootEl?.setAttribute(
      'aria-hidden',
      String(isMobile ? !(isSearchOpen || isBasketOpen) : !isFlyoutOpen)
    )

    searchStarterEl?.setAttribute('aria-controls', 'header-search-flyout')
    basketStarterEl?.setAttribute('aria-controls', 'header-basket-flyout')
    menuStarterEl?.setAttribute('aria-controls', 'global-mobile-menu')
    searchStarterEl?.setAttribute('aria-haspopup', isMobile ? 'dialog' : 'true')
    basketStarterEl?.setAttribute('aria-haspopup', isMobile ? 'dialog' : 'true')
    menuStarterEl?.setAttribute('aria-haspopup', isMobile ? 'dialog' : 'true')
    searchMobileCloseEl?.setAttribute('aria-label', MOBILE_CLOSE_LABELS.search)
    basketMobileCloseEl?.setAttribute('aria-label', MOBILE_CLOSE_LABELS.basket)
    menuMobileCloseEl?.setAttribute('aria-label', MOBILE_CLOSE_LABELS.menu)
    syncMobileFocusIsolation({ mobileFlyoutType })
  }

  const clearPanelHoverCloseTimer = () => {
    if (!panelHoverCloseTimer) {
      return
    }

    window.clearTimeout(panelHoverCloseTimer)
    panelHoverCloseTimer = 0
  }

  const clearPanelHoverArmTimer = () => {
    if (!panelHoverArmTimeoutId) {
      return
    }

    window.clearTimeout(panelHoverArmTimeoutId)
    panelHoverArmTimeoutId = 0
  }

  const disarmPanelHoverClose = () => {
    clearPanelHoverArmTimer()
    isPanelHoverCloseArmed = false
  }

  const armPanelHoverClose = () => {
    disarmPanelHoverClose()
    panelHoverArmTimeoutId = window.setTimeout(() => {
      isPanelHoverCloseArmed = true
      panelHoverArmTimeoutId = 0
    }, GLOBAL_PANEL_CONFIG.hoverCloseArmDelay)
  }

  const isAutoCloseGuardActive = () =>
    activePanelType && Date.now() - panelOpenedAt < GLOBAL_PANEL_CONFIG.autoCloseGuardDuration

  const debugClose = (source, extra = {}) => {
    if (!DEBUG) {
      return
    }

    console.log('[flyout-close]', source, {
      activePanelType,
      ...extra
    })
  }

  const clearPanelVisualStateTimer = () => {
    if (!panelVisualStateTimeoutId) {
      return
    }

    window.clearTimeout(panelVisualStateTimeoutId)
    panelVisualStateTimeoutId = 0
  }

  const isDesktopPointerEnvironment = () =>
    !isMobileViewport() &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const resetPanelVisualStates = () => {
    ;[searchWrapEl, basketEl, panelBackdropEl].forEach((element) => {
      element?.classList.remove('is-active', 'is-open', 'is-animating', 'is-closing', 'show')
    })
  }

  const isPanelVisualTransitioning = () =>
    [searchWrapEl, basketEl, panelBackdropEl].some(
      (element) =>
        element?.classList.contains('is-animating') || element?.classList.contains('is-closing')
    )

  const setSearchOpenMode = (mode = null) => {
    searchOpenMode = mode
  }

  const setBasketOpenMode = (mode = null) => {
    basketOpenMode = mode
  }

  const setHeaderMenuOpenMode = (mode = null) => {
    headerMenuOpenMode = mode
  }

  const isKeyboardBasketSession = () =>
    basketOpenMode === 'keyboard' && activePanelType === 'basket'

  const isKeyboardSearchSession = () =>
    searchOpenMode === 'keyboard' && activePanelType === 'search'

  const isKeyboardHeaderMenuSession = () =>
    headerMenuOpenMode === 'keyboard' && headerEl.classList.contains('menuing')

  const isPointerSearchSession = () =>
    searchOpenMode === 'pointer' && headerEl.classList.contains('searching')

  const getScrollY = () => Math.max(window.scrollY || window.pageYOffset || 0, 0)

  const clearScrollIdleTimer = () => {
    if (!scrollIdleTimeoutId) {
      return
    }

    window.clearTimeout(scrollIdleTimeoutId)
    scrollIdleTimeoutId = 0
  }

  const queueScrollIdleReset = () => {
    clearScrollIdleTimer()
    scrollIdleTimeoutId = window.setTimeout(() => {
      pendingScrollDelta = 0
      lastScrollDirection = 0
      scrollIdleTimeoutId = 0
    }, 120)
  }

  const isHeaderOverlayActive = () =>
    headerEl.classList.contains('is-header-flyout-open') ||
    headerEl.classList.contains('is-global-panel-open') ||
    headerEl.classList.contains('searching') ||
    headerEl.classList.contains('menuing') ||
    headerEl.classList.contains('is-mobile-menu-closing') ||
    headerEl.classList.contains('searching--mobile') ||
    navEl.classList.contains('menuing')

  const setHeaderVisibility = (visible) => {
    headerEl.classList.toggle('is-scroll-hidden', !visible)
    navEl.classList.toggle('is-offset-for-header', visible)
    isHeaderVisible = visible
  }

  const resetHeaderRevealState = () => {
    setHeaderVisibility(true)
  }

  const revealHeader = () => {
    if (!isHeaderVisible) {
      setHeaderVisibility(true)
    }
  }

  const hideHeader = () => {
    if (isHeaderVisible) {
      setHeaderVisibility(false)
    }
  }

  const initializeHeaderRevealState = () => {
    const currentScrollY = getScrollY()
    const activationOffset = Math.max(
      (headerEl.offsetHeight || 0) + 8,
      HEADER_REVEAL_CONFIG.activationOffset
    )

    lastScrollY = currentScrollY
    pendingScrollDelta = 0
    lastScrollDirection = 0
    clearScrollIdleTimer()

    if (
      currentScrollY <= activationOffset ||
      isHeaderOverlayActive() ||
      rootEl.classList.contains('fixed')
    ) {
      setHeaderVisibility(true)
      return
    }

    setHeaderVisibility(false)
  }

  const syncHeaderRevealState = ({ forceVisible = false } = {}) => {
    const currentScrollY = getScrollY()
    const activationOffset = Math.max(
      (headerEl.offsetHeight || 0) + 8,
      HEADER_REVEAL_CONFIG.activationOffset
    )

    if (currentScrollY <= activationOffset) {
      resetHeaderRevealState()
      lastScrollY = currentScrollY
      pendingScrollDelta = 0
      lastScrollDirection = 0
      clearScrollIdleTimer()
      return
    }

    if (forceVisible || isHeaderOverlayActive() || rootEl.classList.contains('fixed')) {
      revealHeader()
      lastScrollY = currentScrollY
      pendingScrollDelta = 0
      lastScrollDirection = 0
      clearScrollIdleTimer()
      return
    }

    const delta = currentScrollY - lastScrollY
    lastScrollY = currentScrollY

    if (Math.abs(delta) < 1) {
      return
    }

    const direction = delta > 0 ? 1 : -1

    if (lastScrollDirection && lastScrollDirection !== direction) {
      pendingScrollDelta = 0
    }

    if (
      (direction > 0 && !isHeaderVisible) ||
      (direction < 0 && isHeaderVisible)
    ) {
      pendingScrollDelta = 0
      lastScrollDirection = direction
      queueScrollIdleReset()
      return
    } else {
      pendingScrollDelta += delta
    }

    lastScrollDirection = direction
    queueScrollIdleReset()

    if (pendingScrollDelta >= HEADER_REVEAL_CONFIG.hideThreshold) {
      hideHeader()
      pendingScrollDelta = 0
      return
    }

    if (pendingScrollDelta <= HEADER_REVEAL_CONFIG.revealThreshold * -1) {
      revealHeader()
      pendingScrollDelta = 0
    }
  }

  const queueHeaderRevealSync = (options) => {
    if (options?.forceVisible) {
      syncHeaderRevealState(options)
      return
    }

    if (isHeaderRevealTicking) {
      return
    }

    isHeaderRevealTicking = true
    window.requestAnimationFrame(() => {
      isHeaderRevealTicking = false
      syncHeaderRevealState()
    })
  }

  const syncFlyoutPanelMetrics = (type = activePanelType) => {
    if (type === 'basket') {
      syncBasketPanelHeight()
    }

    const headerHeight = headerEl.offsetHeight || 44
    const defaultPanelHeight =
      parseInt(getComputedStyle(rootEl).getPropertyValue('--global-panel-height'), 10) || 388
    let panelBottom = headerHeight + defaultPanelHeight

    if (type) {
      const panelContentEl = getPanelContent(type) ?? getPanel(type)

      if (panelContentEl) {
        panelBottom = isMobileViewport()
          ? headerHeight
          : Math.max(Math.round(panelContentEl.getBoundingClientRect().bottom), headerHeight)
      }
    }

    rootEl.style.setProperty('--global-panel-top', `${headerHeight}px`)
    rootEl.style.setProperty('--global-panel-bottom', `${panelBottom}px`)
    rootEl.style.setProperty('--global-panel-backdrop-top', `${panelBottom}px`)
    rootEl.style.setProperty('--search-overlay-top', `${panelBottom}px`)
    rootEl.style.setProperty('--basket-overlay-top', `${panelBottom}px`)
    rootEl.style.setProperty('--search-panel-bottom', `${panelBottom}px`)
  }

  const syncGlobalPanelBackdropPosition = (type = activePanelType) => {
    syncFlyoutPanelMetrics(type)
  }

  const syncSearchOverlayPosition = () => {
    syncFlyoutPanelMetrics('search')
  }

  const syncBasketOverlayPosition = () => {
    syncFlyoutPanelMetrics('basket')
  }

  const syncInteractiveStates = () => {
    const visualPanelType = activePanelType ?? closingPanelType ?? renderedPanelType
    const isBasketOpen = activePanelType === 'basket'
    const isSearchOpen = activePanelType === 'search'
    const isBasketRendered = visualPanelType === 'basket'
    const isSearchRendered = visualPanelType === 'search'
    const isHeaderMenuOpen = headerEl.classList.contains('menuing')
    const isMobileMenuClosing = headerEl.classList.contains('is-mobile-menu-closing')
    const isHeaderMenuVisible = isHeaderMenuOpen || (isMobileViewport() && isMobileMenuClosing)
    const isNavMenuOpen = navEl.classList.contains('menuing')
    const isFlyoutOpen = Boolean(visualPanelType)
    const mobileFlyoutType = isMobileViewport()
      ? isHeaderMenuVisible
        ? 'menu'
        : visualPanelType
      : null
    const isMobileFlyoutClosing = isMobileViewport() && Boolean(isMobileMenuClosing || closingPanelType)

    rootEl.classList.toggle('is-header-flyout-open', isFlyoutOpen)
    headerEl.classList.toggle('is-header-flyout-open', isFlyoutOpen)
    headerEl.classList.toggle('is-search-open', isSearchOpen)
    headerEl.classList.toggle('is-basket-open', isBasketOpen)
    headerEl.classList.toggle('is-global-panel-open', isFlyoutOpen)
    headerEl.classList.toggle('is-search-panel-open', isSearchOpen)
    headerEl.classList.toggle('is-basket-panel-open', isBasketOpen)
    headerEl.classList.toggle('searching', isSearchOpen)
    headerEl.classList.toggle('basketing', isBasketOpen)
    basketEl?.classList.toggle('show', isBasketRendered)
    basketEl?.classList.toggle('is-active', isBasketRendered)
    searchWrapEl?.classList.toggle('is-active', isSearchRendered)
    flyoutRootEl?.setAttribute(
      'aria-hidden',
      String(isMobileViewport() ? !(isSearchRendered || isBasketRendered) : !isFlyoutOpen)
    )
    setExpandedState(basketStarterEl, isBasketOpen)
    setExpandedState(searchStarterEl, isSearchOpen)
    setExpandedState(menuStarterEl, isHeaderMenuOpen)
    setExpandedState(navMenuToggleEl, isNavMenuOpen)
    setHiddenState(basketEl, !isBasketRendered)
    setHiddenState(searchWrapEl, !isSearchRendered)
    setHiddenState(panelBackdropEl, isMobileViewport() || !isFlyoutOpen)
    setHiddenState(cloneMenuEl, !isHeaderMenuVisible || !isMobileViewport())
    setHiddenState(navMenuEl, isMobileViewport() ? !isNavMenuOpen : false)
    syncPanelAccessibility({
      isSearchOpen,
      isBasketOpen,
      isHeaderMenuOpen,
      isFlyoutOpen,
      mobileFlyoutType
    })
    bodyEl?.classList.toggle('is-mobile-flyout-open', Boolean(mobileFlyoutType))
    bodyEl?.classList.toggle('is-mobile-flyout-closing', isMobileFlyoutClosing)

    if (bodyEl) {
      if (mobileFlyoutType) {
        bodyEl.dataset.mobileFlyout = mobileFlyoutType
      } else {
        delete bodyEl.dataset.mobileFlyout
      }
    }

    if (isMobileViewport() && mobileFlyoutType) {
      if (lastInitialFocusedMobileFlyoutType !== mobileFlyoutType) {
        lastInitialFocusedMobileFlyoutType = mobileFlyoutType
        queueMobilePanelInitialFocus(mobileFlyoutType)
      }
    } else {
      lastInitialFocusedMobileFlyoutType = null
      clearProgrammaticCloseButtonFocusState()
    }

    basketStarterEl?.setAttribute(
      'aria-label',
      isBasketOpen ? MOBILE_TRIGGER_LABELS.basket.close : MOBILE_TRIGGER_LABELS.basket.open
    )
    searchStarterEl?.setAttribute(
      'aria-label',
      isSearchOpen ? MOBILE_TRIGGER_LABELS.search.close : MOBILE_TRIGGER_LABELS.search.open
    )
    menuStarterEl?.setAttribute(
      'aria-label',
      isHeaderMenuOpen ? MOBILE_TRIGGER_LABELS.menu.close : MOBILE_TRIGGER_LABELS.menu.open
    )
    navMenuToggleEl?.setAttribute(
      'aria-label',
      isNavMenuOpen ? '제품 메뉴 닫기' : '제품 메뉴 열기'
    )

    syncHeaderRevealState({ forceVisible: isHeaderOverlayActive() })
  }

  const clearSearchFocusTimer = () => {
    if (!searchFocusTimeoutId) {
      return
    }

    window.clearTimeout(searchFocusTimeoutId)
    searchFocusTimeoutId = 0
  }

  const unlockScroll = () => {
    if (!rootEl.classList.contains('fixed')) {
      return
    }

    const lockedTop = Math.abs(parseInt(rootEl.style.top || '0', 10)) || scrollLockY

    rootEl.classList.remove('fixed')
    rootEl.style.top = ''
    window.scrollTo(0, lockedTop)
  }

  const lockScroll = () => {
    if (rootEl.classList.contains('fixed')) {
      return
    }

    scrollLockY = window.scrollY || window.pageYOffset
    rootEl.style.top = `${scrollLockY * -1}px`
    rootEl.classList.add('fixed')
  }

  const syncScrollLock = () => {
    const shouldLock =
      headerEl.classList.contains('menuing') ||
      headerEl.classList.contains('is-mobile-menu-closing') ||
      headerEl.classList.contains('searching--mobile') ||
      (isMobileViewport() && Boolean(activePanelType)) ||
      (isMobileViewport() && navEl.classList.contains('menuing'))

    shouldLock ? lockScroll() : unlockScroll()
    syncInteractiveStates()
  }

  const closeHeaderMenu = ({ restoreFocus = false } = {}) => {
    const isMobileMenu = isMobileViewport()
    const isMenuOpen = headerEl.classList.contains('menuing')
    const restoreTargetEl = restoreFocus ? getMobilePanelTrigger('menu') : null

    if (isMobileMenu && isMenuOpen) {
      clearMobileMenuCloseTimer()
      clearMobilePanelFocusTimer()
      clearProgrammaticCloseButtonFocusState()
      headerEl.classList.remove('menuing')
      headerEl.classList.add('is-mobile-menu-closing')
      cloneMenuEl?.classList.remove('is-open')
      cloneMenuEl?.classList.add('is-closing')
      setHeaderMenuOpenMode()
      syncScrollLock()

      mobileMenuCloseTimeoutId = window.setTimeout(() => {
        headerEl.classList.remove('is-mobile-menu-closing')
        cloneMenuEl?.classList.remove('is-closing')
        syncScrollLock()
        queueFocusReturn(restoreTargetEl, { panelType: 'menu' })
        mobileMenuCloseTimeoutId = 0
      }, prefersReducedMotion() ? 20 : MOBILE_MENU_CONFIG.closeCleanupDuration)
    } else {
      clearMobileMenuCloseTimer()
      clearMobilePanelFocusTimer()
      clearProgrammaticCloseButtonFocusState()
      headerEl.classList.remove('menuing', 'is-mobile-menu-closing')
      cloneMenuEl?.classList.remove('is-open', 'is-closing')
      setHeaderMenuOpenMode()
      syncScrollLock()
      queueFocusReturn(restoreTargetEl, { panelType: 'menu' })
    }
  }

  const closeMobileSearch = () => {
    headerEl.classList.remove('searching--mobile')
    clearSearchKeyboardFocusState()
    syncInteractiveStates()
  }

  const hideNavMenu = () => {
    navEl.classList.remove('menuing')
    syncScrollLock()
  }

  const moveFocusOutOfClosingFlyout = (closingType, closingPanelEl, restoreTargetEl = null) => {
    const activeEl = document.activeElement

    if (!(closingPanelEl instanceof HTMLElement) || !(activeEl instanceof HTMLElement)) {
      return
    }

    if (!closingPanelEl.contains(activeEl)) {
      return
    }

    const fallbackTargetEl =
      restoreTargetEl instanceof HTMLElement ? restoreTargetEl : getMobilePanelTrigger(closingType)

    // The trigger can be inside an inert header group while the mobile dialog is open.
    // Release that group first, then move focus before aria-hidden is applied to .header-flyout.
    if (isMobileViewport()) {
      headerFocusGuardEls.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.inert = false
        }
      })
    }

    if (fallbackTargetEl instanceof HTMLElement) {
      fallbackTargetEl.focus({ preventScroll: true })

      if (document.activeElement === fallbackTargetEl) {
        return
      }
    }

    activeEl.blur()
  }

  const closeHeaderFlyout = ({
    reason = 'unknown',
    restoreFocus = false,
    clearSearchInput = true
  } = {}) => {
    if (!activePanelType) {
      debugClose('close-header-flyout-noop', { reason })
      return
    }

    debugClose('close-header-flyout', { reason })

    const closingType = activePanelType
    const closingPanelEl = getPanel(closingType)
    const restoreTargetEl = restoreFocus ? lastPanelTriggerEl : null

    moveFocusOutOfClosingFlyout(closingType, closingPanelEl, restoreTargetEl)

    clearPanelHoverCloseTimer()
    disarmPanelHoverClose()
    clearPanelVisualStateTimer()
    clearSearchFocusTimer()
    clearMobilePanelFocusTimer()
    clearProgrammaticCloseButtonFocusState()
    renderedPanelType = closingType
    closingPanelType = closingType
    activePanelType = null
    closingPanelEl?.classList.remove('is-open', 'is-animating')
    closingPanelEl?.classList.add('is-closing')
    panelBackdropEl?.classList.remove('is-open', 'is-animating')
    panelBackdropEl?.classList.add('is-closing')

    if (clearSearchInput && searchInputEl) {
      searchInputEl.value = ''
    }

    if (closingType === 'search') {
      setTransitionDelays(headerMenuEls, { reverse: true })
      setTransitionDelays(searchDelayEls, { reverse: true })
    }

    syncSearchResetState()
    clearSearchKeyboardFocusState()
    setSearchOpenMode()
    setBasketOpenMode()
    panelOpenedAt = 0
    syncGlobalPanelBackdropPosition(closingType)
    syncScrollLock()
    syncInteractiveStates()

    // Keep the curtain alive just a touch longer than the panel to avoid a visible seam on close.
    panelVisualStateTimeoutId = window.setTimeout(() => {
      if (closingPanelType !== closingType) {
        panelVisualStateTimeoutId = 0
        return
      }

      closingPanelEl?.classList.remove('is-active', 'is-closing', 'show')
      panelBackdropEl?.classList.remove('is-closing')
      renderedPanelType = null
      closingPanelType = null
      syncInteractiveStates()
      panelVisualStateTimeoutId = 0
    }, getPanelCloseCleanupDuration())

    queueFocusReturn(restoreTargetEl, {
      panelType: closingType,
      delay: getPanelCloseCleanupDuration()
    })
    lastPanelTriggerEl = null
  }

  // Panel switches should tear down the previous flyout immediately so search/basket never overlap.
  const forceCompleteFlyoutClose = ({ clearSearchInput = true } = {}) => {
    clearPanelHoverCloseTimer()
    disarmPanelHoverClose()
    clearPanelVisualStateTimer()
    clearSearchFocusTimer()
    clearMobilePanelFocusTimer()
    clearProgrammaticCloseButtonFocusState()
    clearPendingFocusReturn()
    resetPanelVisualStates()

    if (clearSearchInput && searchInputEl) {
      searchInputEl.value = ''
    }

    activePanelType = null
    renderedPanelType = null
    closingPanelType = null
    panelOpenedAt = 0
    lastPanelTriggerEl = null
    setSearchOpenMode()
    setBasketOpenMode()
    syncSearchResetState()
    clearSearchKeyboardFocusState()
    syncScrollLock()
    syncInteractiveStates()
  }

  const openHeaderFlyout = (type, { mode = 'pointer' } = {}) => {
    const panelEl = getPanel(type)
    const triggerEl = getTrigger(type)

    if (!panelEl || !triggerEl) {
      return
    }

    if (activePanelType === type) {
      if (isMobilePanelType(type)) {
        return
      }

      debugClose('trigger-toggle', { type })
      closeGlobalPanel({ reason: 'trigger-toggle', restoreFocus: true })
      return
    }

    if (renderedPanelType || closingPanelType) {
      debugClose('panel-switch', { from: activePanelType, to: type })
      forceCompleteFlyoutClose({ clearSearchInput: type !== 'search' })
    }

    hideNavMenu()
    closeHeaderMenu()
    closeMobileSearch()
    clearPanelHoverCloseTimer()
    disarmPanelHoverClose()
    clearPanelVisualStateTimer()
    clearPendingFocusReturn()
    resetPanelVisualStates()

    closingPanelType = null
    renderedPanelType = type
    activePanelType = type
    panelOpenedAt = Date.now()
    lastPanelTriggerEl = triggerEl
    panelEl.classList.add('is-active')
    panelEl.classList.add('is-animating')
    panelBackdropEl?.classList.add('is-animating')

    if (type === 'search') {
      setSearchOpenMode(mode)
      setBasketOpenMode()
      setTransitionDelays(headerMenuEls, { reverse: true })
      setTransitionDelays(searchDelayEls)
      clearSearchFocusTimer()
      clearSearchKeyboardFocusState()
      syncSearchResetState()
    } else {
      setBasketOpenMode(mode)
      setSearchOpenMode()
    }

    syncGlobalPanelBackdropPosition(type)
    syncScrollLock()
    syncInteractiveStates()
    window.requestAnimationFrame(() => {
      panelEl.classList.add('is-open')
      panelBackdropEl?.classList.add('is-open')
    })
    panelVisualStateTimeoutId = window.setTimeout(() => {
      panelEl.classList.remove('is-animating')
      panelBackdropEl?.classList.remove('is-animating')
      panelVisualStateTimeoutId = 0
    }, getPanelOpenDuration())
    armPanelHoverClose()

    if (isMobilePanelType(type)) {
      return
    }

    if (type === 'search') {
      searchFocusTimeoutId = window.setTimeout(() => {
        syncGlobalPanelBackdropPosition(type)
        focusSearchInput()
      }, getSearchFocusDelay())
      return
    }

    if (mode === 'keyboard') {
      window.requestAnimationFrame(() => {
        syncGlobalPanelBackdropPosition(type)
        const initialFocusEl = isMobileViewport()
          ? getMobileCloseButton(type) ?? basketMenuLinkEls[0]
          : basketMenuLinkEls[0]
        initialFocusEl?.focus()
      })
    }
  }

  const closeGlobalPanel = (options = {}) => {
    closeHeaderFlyout(options)
  }

  const openGlobalPanel = (type, options = {}) => {
    openHeaderFlyout(type, options)
  }

  const hideBasket = ({ restoreFocus = false } = {}) => {
    if (activePanelType !== 'basket') {
      return
    }

    debugClose('hide-basket', { restoreFocus })
    closeGlobalPanel({ reason: 'hide-basket', restoreFocus })
  }

  const showBasket = ({ mode = 'pointer' } = {}) => {
    openGlobalPanel('basket', { mode })
  }

  const hideSearch = ({ clearInput = true, restoreFocus = false } = {}) => {
    if (activePanelType !== 'search') {
      if (clearInput && searchInputEl) {
        searchInputEl.value = ''
        syncSearchResetState()
      }

      return
    }

    debugClose('hide-search', { restoreFocus, clearInput })
    closeGlobalPanel({ reason: 'hide-search', restoreFocus, clearSearchInput: clearInput })
  }

  const closeAllNavigationLayers = ({ preserveSearch = false, restoreFocus = false } = {}) => {
    const shouldKeepSearchOpen = preserveSearch && activePanelType === 'search'
    const shouldRestoreHeaderMenuFocus =
      restoreFocus && isMobileViewport() && headerEl.classList.contains('menuing')

    if (!shouldKeepSearchOpen) {
      const shouldRestorePanelFocus = restoreFocus && Boolean(activePanelType)
      debugClose('close-all-navigation-layers', { restoreFocus: shouldRestorePanelFocus })
      closeGlobalPanel({ reason: 'close-all-navigation-layers', restoreFocus: shouldRestorePanelFocus })
    }

    hideNavMenu()
    closeHeaderMenu({ restoreFocus: shouldRestoreHeaderMenuFocus || (restoreFocus && isKeyboardHeaderMenuSession()) })
    closeMobileSearch()

    if (preserveSearch) {
      syncScrollLock()
      return
    }
  }

  const showSearch = ({ mode = 'pointer' } = {}) => {
    if (!searchInputEl) {
      return
    }

    openGlobalPanel('search', { mode })
  }

  const showNavMenu = () => {
    hideBasket()
    hideSearch()
    closeHeaderMenu()
    closeMobileSearch()
    navEl.classList.add('menuing')
    syncScrollLock()
  }

  const toggleHeaderMenu = ({ mode = 'pointer' } = {}) => {
    if (isMobileViewport() && (activePanelType || headerEl.classList.contains('is-mobile-menu-closing'))) {
      return
    }

    if (headerEl.classList.contains('searching--mobile')) {
      closeMobileSearch()
      closeHeaderMenu()
      syncScrollLock()
      return
    }

    if (activePanelType) {
      debugClose('header-menu-toggle', { restoreFocus: true })
      closeGlobalPanel({ reason: 'header-menu-toggle', restoreFocus: true })
      return
    }
    hideNavMenu()
    closeMobileSearch()

    if (headerEl.classList.contains('menuing')) {
      if (isMobileViewport()) {
        return
      }

      closeHeaderMenu()

      if (searchInputEl) {
        searchInputEl.value = ''
      }
    } else {
      hideSearch()
      clearMobileMenuCloseTimer()
      clearPendingFocusReturn()
      headerEl.classList.remove('is-mobile-menu-closing')
      cloneMenuEl?.classList.remove('is-closing')
      cloneMenuEl?.classList.add('is-open')
      headerEl.classList.add('menuing')
      setHeaderMenuOpenMode(mode)
    }

    syncScrollLock()

    if (isMobileViewport() && headerEl.classList.contains('menuing')) {
      syncInteractiveStates()
    }
  }

  const openMobileSearch = () => {
    if (!searchInputEl) {
      return
    }

    openGlobalPanel('search', { mode: 'pointer' })
  }

  const handleSearchWrapFocusOut = (event) => {
    if (isMobileViewport()) {
      return
    }

    if (activePanelType !== 'search' || !isKeyboardSearchSession()) {
      return
    }

    if (isAutoCloseGuardActive()) {
      return
    }

    const nextFocusedElement = event.relatedTarget

    if (nextFocusedElement && searchWrapEl?.contains(nextFocusedElement)) {
      return
    }

    window.requestAnimationFrame(() => {
      if (searchWrapEl?.contains(document.activeElement)) {
        return
      }

      debugClose('focusout', { panel: 'search' })
      closeGlobalPanel({ reason: 'focusout' })
    })
  }

  const handleGlobalPanelMotionClose = (reason = 'scroll') => {
    if (isMobileViewport()) {
      return
    }

    if (!activePanelType || isAutoCloseGuardActive()) {
      return
    }

    debugClose(reason)
    closeGlobalPanel({ reason })
  }

  const handleBasketWrapFocusOut = (event) => {
    if (isMobileViewport()) {
      return
    }

    if (activePanelType !== 'basket' || !isKeyboardBasketSession()) {
      return
    }

    if (isAutoCloseGuardActive()) {
      return
    }

    const nextFocusedElement = event.relatedTarget

    if (nextFocusedElement && basketWrapEl?.contains(nextFocusedElement)) {
      return
    }

    window.requestAnimationFrame(() => {
      if (basketWrapEl?.contains(document.activeElement)) {
        return
      }

      debugClose('focusout', { panel: 'basket' })
      closeGlobalPanel({ reason: 'focusout' })
    })
  }

  const scheduleDesktopCurtainClose = () => {
    if (
      !activePanelType ||
      !isDesktopPointerEnvironment() ||
      !isPanelHoverCloseArmed ||
      isAutoCloseGuardActive()
    ) {
      return
    }

    clearPanelHoverCloseTimer()
    panelHoverCloseTimer = window.setTimeout(() => {
      if (!activePanelType) {
        return
      }

      debugClose('curtain-hover-close', { panel: activePanelType })
      closeGlobalPanel({ reason: 'curtain-hover-close' })
    }, 150)
  }

  const handleDesktopNavHoverClose = (event) => {
    if (!activePanelType || !isDesktopPointerEnvironment() || isAutoCloseGuardActive()) {
      return
    }

    const hoveredItemEl = event.target.closest('ul.menu > li')
    const activeTriggerItemEl = getTriggerListItem()

    if (!hoveredItemEl || !globalMenuListEl?.contains(hoveredItemEl)) {
      return
    }

    if (!activeTriggerItemEl || hoveredItemEl === activeTriggerItemEl) {
      clearPanelHoverCloseTimer()
      return
    }

    clearPanelHoverCloseTimer()
    panelHoverCloseTimer = window.setTimeout(() => {
      if (activePanelType && hoveredItemEl !== getTriggerListItem()) {
        debugClose('nav-hover-close', { hoveredItem: hoveredItemEl.className || hoveredItemEl.textContent?.trim() || 'nav-item' })
        closeGlobalPanel({ reason: 'nav-hover-close' })
      }
    }, 90)
  }

  /* 理쒓렐 ?낅젰 ?섎떒 異붿쟻
     - Tab / Enter / Space / 諛⑺뼢?????ㅻ낫???먯깋 媛?μ꽦???믪? ?낅젰?대㈃ true
     - 留덉슦???ъ씤???곗튂??false */
  window.addEventListener('keydown', (event) => {
    const { key, metaKey, altKey, ctrlKey } = event

    if (metaKey || altKey || ctrlKey) {
      return
    }

    const keyboardNavigationKeys = [
      'Tab',
      'Enter',
      ' ',
      'Spacebar',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight'
    ]

    if (keyboardNavigationKeys.includes(key)) {
      setKeyboardInteraction()
    }
  })

  window.addEventListener('mousedown', clearKeyboardInteraction)
  window.addEventListener('pointerdown', clearKeyboardInteraction)
  window.addEventListener('touchstart', clearKeyboardInteraction, { passive: true })
  window.addEventListener('scroll', () => handleGlobalPanelMotionClose('scroll'), { passive: true })
  window.addEventListener('wheel', () => handleGlobalPanelMotionClose('wheel'), { passive: true })
  window.addEventListener('touchmove', () => handleGlobalPanelMotionClose('touchmove'), { passive: true })
  window.addEventListener('scroll', () => {
    syncBrowserTopOffset()
    queueHeaderRevealSync()
  }, { passive: true })

  window.visualViewport?.addEventListener('resize', () => {
    syncBrowserTopOffset()
    syncBasketPanelHeight()
    syncGlobalPanelBackdropPosition()
  })
  window.visualViewport?.addEventListener('scroll', () => {
    syncBrowserTopOffset()
    syncGlobalPanelBackdropPosition()
  })

  searchInputEl?.addEventListener('focus', () => {
    applySearchKeyboardFocusState()
  })

  searchInputEl?.addEventListener('input', () => {
    syncSearchResetState()
  })

  searchInputEl?.addEventListener('blur', () => {
    clearSearchKeyboardFocusState()
  })

  searchResetEl?.addEventListener('click', (event) => {
    event.stopPropagation()

    if (!searchInputEl) {
      return
    }

    searchInputEl.value = ''
    syncSearchResetState()
    focusSearchInput()
  })

  basketWrapEl?.addEventListener('focusout', handleBasketWrapFocusOut)

  panelTriggerEls.forEach((triggerEl) => {
    triggerEl.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (isMobileViewport() && (activePanelType || headerEl.classList.contains('menuing') || headerEl.classList.contains('is-mobile-menu-closing'))) {
        return
      }

      if (isPanelVisualTransitioning()) {
        return
      }

      openGlobalPanel(triggerEl.dataset.panelTrigger, {
        mode: isKeyboardInteraction ? 'keyboard' : 'pointer'
      })
    })
  })

  headerEl.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  globalMenuListEl?.addEventListener('pointerover', handleDesktopNavHoverClose)

  searchWrapEl?.addEventListener('click', (event) => {
    event.stopPropagation()
  })
  basketEl?.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  searchWrapEl?.addEventListener('pointerenter', clearPanelHoverCloseTimer)
  basketEl?.addEventListener('pointerenter', clearPanelHoverCloseTimer)

  searchWrapEl?.addEventListener('focusout', handleSearchWrapFocusOut)
  panelBackdropEl?.addEventListener('click', () => {
    if (isMobileViewport()) {
      return
    }

    if (isAutoCloseGuardActive()) {
      return
    }

    debugClose('curtain-click')
    closeGlobalPanel({ reason: 'curtain-click' })
  })
  panelBackdropEl?.addEventListener('pointerenter', scheduleDesktopCurtainClose)
  panelBackdropEl?.addEventListener('pointerleave', clearPanelHoverCloseTimer)

  ;[
    ['menu', cloneMenuEl],
    ['search', searchWrapEl],
    ['basket', basketEl]
  ].forEach(([type, panelEl]) => {
    panelEl?.addEventListener('keydown', (event) => {
      trapMobilePanelFocus(type, event)
    })
  })

  document.addEventListener('focusin', (event) => {
    const mobileFlyoutType = getActiveMobileFlyoutType()

    if (!mobileFlyoutType) {
      return
    }

    const panelEl = getMobileFlyoutContainer(mobileFlyoutType)

    if (!panelEl || panelEl.contains(event.target)) {
      return
    }

    queueMobilePanelInitialFocus(mobileFlyoutType)
  })

  searchQuickLinkEls.forEach((element, index) => {
    const isLastQuickLink = index === searchQuickLinkEls.length - 1

    element.addEventListener('keydown', (event) => {
      if (isMobileViewport()) {
        return
      }

      if (
        !isKeyboardSearchSession() ||
        !isLastQuickLink ||
        event.key !== 'Tab' ||
        event.shiftKey
      ) {
        return
      }

      event.preventDefault()
      const nextFocusableEl =
        basketStarterEl instanceof HTMLElement
          ? basketStarterEl
          : getNextFocusableElement(searchStarterEl)

      debugClose('search-last-tab')
      closeGlobalPanel({ reason: 'search-last-tab' })
      nextFocusableEl?.focus({ preventScroll: true })
    })
  })

  basketMenuLinkEls.forEach((element, index) => {
    const isLastBasketLink = index === basketMenuLinkEls.length - 1

    element.addEventListener('keydown', (event) => {
      if (isMobileViewport()) {
        return
      }

      if (
        !isKeyboardBasketSession() ||
        !isLastBasketLink ||
        event.key !== 'Tab' ||
        event.shiftKey
      ) {
        return
      }

      event.preventDefault()

      const nextFocusableEl =
        menuStarterEl instanceof HTMLElement
          ? menuStarterEl
          : getNextFocusableElement(basketStarterEl)

      debugClose('basket-last-tab')
      hideBasket()
      nextFocusableEl?.focus({ preventScroll: true })
    })
  })

  cloneMenuLinkEls.forEach((element, index) => {
    const isLastCloneMenuLink = index === cloneMenuLinkEls.length - 1

    element.addEventListener('keydown', (event) => {
      if (isMobileViewport()) {
        return
      }

      if (!isKeyboardHeaderMenuSession() || event.key !== 'Tab') {
        return
      }

      if (!event.shiftKey && isLastCloneMenuLink) {
        event.preventDefault()
        const nextFocusableEl = getNextFocusableElement(element)

        closeHeaderMenu()
        nextFocusableEl?.focus()
      }
    })
  })

  mobilePanelCloseEls.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.stopPropagation()

      const { mobilePanelClose } = element.dataset

      if (mobilePanelClose === 'menu') {
        closeHeaderMenu({ restoreFocus: true })
        syncScrollLock()
        return
      }

      if (mobilePanelClose && activePanelType === mobilePanelClose) {
        debugClose('mobile-panel-close', { panel: mobilePanelClose, restoreFocus: true })
        closeGlobalPanel({ reason: 'mobile-panel-close', restoreFocus: true })
      }
    })

    element.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        clearProgrammaticCloseButtonFocusState()
      }

      if (event.key !== 'Tab' || !event.shiftKey) {
        return
      }

      const { mobilePanelClose } = element.dataset

      if (isMobileViewport() && mobilePanelClose) {
        trapMobilePanelFocus(mobilePanelClose, event)
        return
      }

      if (mobilePanelClose === 'menu' && isKeyboardHeaderMenuSession()) {
        event.preventDefault()
        closeHeaderMenu({ restoreFocus: true })
        return
      }

      if (mobilePanelClose === activePanelType) {
        event.preventDefault()
        closeGlobalPanel({ reason: 'mobile-panel-shift-tab', restoreFocus: true })
      }
    })

    element.addEventListener('blur', () => {
      element.classList.remove('is-programmatic-focus')
    })
  })

  menuStarterEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    toggleHeaderMenu({ mode: isKeyboardInteraction ? 'keyboard' : 'pointer' })
  })

  searchTextFieldEl?.addEventListener('click', (event) => {
    if (!isMobileViewport() || headerEl.classList.contains('searching')) {
      return
    }

    event.stopPropagation()
    openMobileSearch()
  })

  searchCancelEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    closeMobileSearch()
    syncScrollLock()
  })

  navMenuToggleEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    navEl.classList.contains('menuing') ? hideNavMenu() : showNavMenu()
  })

  navEl.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  navMenuShadowEl?.addEventListener('click', hideNavMenu)

  window.addEventListener('click', () => {
    if (activePanelType || getActiveMobileFlyoutType() || headerEl.classList.contains('is-mobile-menu-closing')) {
      return
    }

    closeAllNavigationLayers()
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (activePanelType) {
        debugClose('escape', { restoreFocus: true })
        closeGlobalPanel({ reason: 'escape', restoreFocus: true })
        return
      }

      closeAllNavigationLayers({ restoreFocus: true })
    }
  })

  window.addEventListener('resize', () => {
    clearMobilePanelFocusTimer()
    clearProgrammaticCloseButtonFocusState()
    clearPendingFocusReturn()
    syncBrowserTopOffset()
    syncBasketPanelHeight()
    syncGlobalPanelBackdropPosition()

    if (isMobileViewport()) {
      headerEl.classList.remove('searching')
    } else {
      closeHeaderMenu()
      closeMobileSearch()
      hideNavMenu()
    }

    clearSearchKeyboardFocusState()
    syncScrollLock()
    syncHeaderRevealState()
  })

  rootEl.style.setProperty(
    '--header-reveal-duration',
    `${HEADER_REVEAL_CONFIG.transitionDuration}ms`
  )

  syncBrowserTopOffset()
  syncBasketPanelHeight()
  syncGlobalPanelBackdropPosition()
  syncSearchResetState()
  syncInteractiveStates()
  initializeHeaderRevealState()

  // Browsers may restore scroll position after initial script execution.
  window.requestAnimationFrame(() => {
    syncBrowserTopOffset()
    syncBasketPanelHeight()
    syncGlobalPanelBackdropPosition()
    initializeHeaderRevealState()
  })

  window.addEventListener('pageshow', () => {
    syncBrowserTopOffset()
    syncBasketPanelHeight()
    syncGlobalPanelBackdropPosition()
    initializeHeaderRevealState()
  })
}

const initIntersectionReveal = () => {
  const infoEls = [...document.querySelectorAll('.info')]

  if (!infoEls.length) {
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show')
      }
    })
  })

  infoEls.forEach((element) => {
    observer.observe(element)
  })
}

const initStageVideoControls = () => {
  const stageVideoEl = document.querySelector('.stage video')
  const playBtnEl = document.querySelector('.stage .controller--play')
  const pauseBtnEl = document.querySelector('.stage .controller--pause')

  if (!stageVideoEl || !playBtnEl || !pauseBtnEl) {
    return
  }

  playBtnEl.addEventListener('click', () => {
    stageVideoEl.play()
    playBtnEl.classList.add('hide')
    pauseBtnEl.classList.remove('hide')
  })

  pauseBtnEl.addEventListener('click', () => {
    stageVideoEl.pause()
    playBtnEl.classList.remove('hide')
    pauseBtnEl.classList.add('hide')
  })
}

const renderCompareSection = () => {
  const itemsEl = document.querySelector('section.compare .items')

  if (!itemsEl) {
    return
  }

  itemsEl.innerHTML = ''

  ipads.forEach((ipad) => {
    const itemEl = document.createElement('article')
    const colorList = ipad.colors
      .map((color) => `<li aria-hidden="true" style="background-color: ${color};"></li>`)
      .join('')

    itemEl.classList.add('item')
    itemEl.setAttribute('role', 'listitem')
    itemEl.innerHTML = /* html */ `
      <div class="thumbnail">
        <img src="${ipad.thumbnail}" alt="${ipad.name}" />
      </div>
      <ul class="colors" aria-label="${ipad.name} 색상">
        ${colorList}
      </ul>
      <h3 class="name">${ipad.name}</h3>
      <p class="tagline">${ipad.tagline}</p>
      <p class="price">₩${ipad.price.toLocaleString('ko-KR')}&nbsp;부터</p>
      <a href="${toAbsoluteAppleUrl(ipad.url)}" class="btn" aria-label="${ipad.name} 구입하기">구입하기</a>
      <a href="${toAbsoluteAppleUrl(ipad.url)}" class="link" aria-label="${ipad.name} 더 알아보기">더 알아보기</a>
    `

    itemsEl.append(itemEl)
  })
}

const initFooterNavigation = () => {
  const navigationsEl = document.querySelector('footer .navigations')
  const thisYearEl = document.querySelector('span.this-year')

  if (navigationsEl) {
    navigationsEl.innerHTML = ''

    navigations.forEach((navigation, index) => {
      const mapEl = document.createElement('div')
      const listId = `footer-navigation-list-${index + 1}`
      const mapList = navigation.maps
        .map(
          (map) => /* html */ `
            <li>
              <a href="${toAbsoluteAppleUrl(map.url)}">${map.name}</a>
            </li>
          `
        )
        .join('')

      mapEl.classList.add('map')
      mapEl.innerHTML = /* html */ `
        <h3>
          <button type="button" class="map-toggle" aria-expanded="false" aria-controls="${listId}">
            <span class="text">${navigation.title}</span>
            <span class="icon" aria-hidden="true">+</span>
          </button>
        </h3>
        <ul id="${listId}">
          ${mapList}
        </ul>
      `

      navigationsEl.append(mapEl)
    })
  }

  if (thisYearEl) {
    thisYearEl.textContent = new Date().getFullYear()
  }

  const mapEls = [...document.querySelectorAll('footer .navigations .map')]
  const syncFooterNavigationState = () => {
    const isMobileFooter = isMobileViewport()

    mapEls.forEach((element) => {
      const toggleEl = element.querySelector('.map-toggle')
      const listEl = element.querySelector('ul')
      const isExpanded = isMobileFooter ? element.classList.contains('active') : true

      element.classList.toggle('active', isMobileFooter && isExpanded)
      setExpandedState(toggleEl, isExpanded)

      if (listEl) {
        listEl.hidden = !isExpanded
      }
    })
  }

  mapEls.forEach((element) => {
    const headingEl = element.querySelector('.map-toggle')

    headingEl?.addEventListener('click', () => {
      if (!isMobileViewport()) {
        return
      }

      element.classList.toggle('active')
      syncFooterNavigationState()
    })
  })

  window.addEventListener('resize', syncFooterNavigationState)
  syncFooterNavigationState()
}

const initHeroIntro = () => {
  const heroEl = document.querySelector('.hero')

  if (!heroEl) {
    return
  }

  const heroHeadlineWords = [...heroEl.querySelectorAll('.hero__headline-word')]
  const heroHardwareImageEl = heroEl.querySelector('.hero__hardware img')
  const heroHardwareCaptionEls = [...heroEl.querySelectorAll('.hero__hardware figcaption span')]
  const heroHeadlineSrEl = heroEl.querySelector('.hero__headline-sr')
  const heroSubheadEl = heroEl.querySelector('.hero__body .hero__subhead')
  const heroDescriptionEl = heroEl.querySelector('.hero__body .hero__description')
  const heroHighlightEls = [...heroEl.querySelectorAll('.hero__body .hero__highlights li')]
  const heroLinkEls = [...heroEl.querySelectorAll('.hero__body .hero__links a')]
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  let heroTimeoutIds = []

  const revealHeroWords = () => {
    heroHeadlineWords.forEach((word) => {
      word.classList.add('is-visible')
    })
  }

  const clearHeroWords = () => {
    heroHeadlineWords.forEach((word) => {
      word.classList.remove('is-visible')
    })
  }

  const getHeroMotionValues = () =>
    window.innerWidth <= BREAKPOINTS.heroMobile ? HERO_TIMING.mobile : HERO_TIMING.desktop

  const syncHeroMotionVars = () => {
    heroEl.style.setProperty('--hero-logo-split', `${getHeroMotionValues().logoSplit}px`)
  }

  const clearHeroSequenceTimers = () => {
    heroTimeoutIds.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
    heroTimeoutIds = []
  }

  const queueHeroStep = (delay, callback) => {
    const timeoutId = window.setTimeout(callback, delay)
    heroTimeoutIds.push(timeoutId)
  }

  const resetHeroSequence = () => {
    clearHeroSequenceTimers()
    heroEl.classList.remove(...HERO_STATE_CLASSES)
    clearHeroWords()
  }

  const playHeroSequence = () => {
    resetHeroSequence()
    syncHeroMotionVars()

    const timeline = {
      logoColor: HERO_TIMING.logoHold,
      logoSeparate: HERO_TIMING.logoHold + HERO_TIMING.logoColorTransition,
      logoReturn:
        HERO_TIMING.logoHold +
        HERO_TIMING.logoColorTransition +
        HERO_TIMING.logoSeparateTransition +
        HERO_TIMING.logoSeparateHold
    }

    timeline.copyStart =
      timeline.logoReturn + HERO_TIMING.logoReturnTransition + HERO_TIMING.copyRevealDelay
    timeline.detailsStart =
      timeline.copyStart + HERO_TIMING.copySettleDuration + HERO_TIMING.detailsDelay
    timeline.metaStart = timeline.detailsStart + HERO_TIMING.metaDelay

    queueHeroStep(timeline.logoColor, () => {
      heroEl.classList.add('hero--logo-colored')
    })

    queueHeroStep(timeline.logoSeparate, () => {
      heroEl.classList.add('hero--logo-separated')
    })

    queueHeroStep(timeline.logoReturn, () => {
      heroEl.classList.add('hero--logo-returning')
    })

    queueHeroStep(timeline.copyStart, () => {
      heroEl.classList.add('hero--copy-visible')
      revealHeroWords()
    })

    queueHeroStep(timeline.detailsStart, () => {
      heroEl.classList.add('hero--details-visible')
    })

    queueHeroStep(timeline.metaStart, () => {
      heroEl.classList.add('hero--meta-visible')
    })
  }

  const applyReducedMotionState = () => {
    resetHeroSequence()
    syncHeroMotionVars()
    heroEl.classList.add(
      'hero--logo-returning',
      'hero--copy-visible',
      'hero--details-visible',
      'hero--meta-visible'
    )
    revealHeroWords()
  }

  const handleMotionPreferenceChange = (event) => {
    if (event.matches) {
      applyReducedMotionState()
    } else {
      playHeroSequence()
    }
  }

  setTextList(heroHeadlineWords, HERO_COPY.words)
  setText(heroHeadlineSrEl, HERO_COPY.words.join(' '))
  setText(heroSubheadEl, HERO_COPY.subhead)
  setText(heroDescriptionEl, HERO_COPY.description)
  setTextList(heroHighlightEls, HERO_COPY.highlights)
  setTextList(heroLinkEls, HERO_COPY.links)
  setTextList(heroHardwareCaptionEls, HERO_COPY.hardwareLabels)

  if (heroHardwareImageEl) {
    heroHardwareImageEl.alt = HERO_COPY.hardwareAlt
  }

  mediaQuery.matches ? applyReducedMotionState() : playHeroSequence()

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleMotionPreferenceChange)
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleMotionPreferenceChange)
  }

  window.addEventListener('resize', syncHeroMotionVars)
}

initHeaderAndNavigation()
initIntersectionReveal()
initStageVideoControls()
renderCompareSection()
initFooterNavigation()
initHeroIntro()

