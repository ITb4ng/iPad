import ipads from '../data/ipads.js'
import navigations from '../data/navigations.js'

const BREAKPOINTS = Object.freeze({
  mobile: 740,
  heroMobile: 734
})

const SEARCH_CONFIG = Object.freeze({
  staggerDuration: 0.4,
  focusDelay: 280
})

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
  subhead: '전면적으로 즐거운 iPad.',
  description:
    '이제 초고속 A16 칩 탑재. 그 어느 때보다 넉넉한 저장 용량. 시선을 사로잡는 Liquid Retina 디스플레이와 전면 화면 디자인까지.',
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

const isMobileViewport = () => window.innerWidth <= BREAKPOINTS.mobile

const isFocusableElementVisible = (element) => {
  if (!(element instanceof HTMLElement)) {
    return false
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
  const navEl = document.querySelector('nav')

  if (!headerEl || !navEl) {
    return
  }

  const basketStarterEl = headerEl.querySelector('.basket-starter > button')
  const basketEl = headerEl.querySelector('.basket-starter .basket')
  const basketWrapEl = basketStarterEl?.closest('.basket-starter')
  const basketMenuLinkEls = basketEl ? [...basketEl.querySelectorAll('a')] : []
  const headerMenuEls = [...headerEl.querySelectorAll('ul.menu > li')]
  const searchWrapEl = headerEl.querySelector('.search-wrap')
  const searchStarterEl = headerEl.querySelector('.search-starter > button')
  const searchCloserEl = searchWrapEl?.querySelector('.search-closer')
  const searchShadowEl = searchWrapEl?.querySelector('.shadow')
  const searchInputEl = searchWrapEl?.querySelector('input')
  const searchDelayEls = searchWrapEl ? [...searchWrapEl.querySelectorAll('li')] : []
  const searchQuickLinkEls = searchWrapEl
    ? [...searchWrapEl.querySelectorAll('.autocompletes a')]
    : []
  const menuStarterEl = headerEl.querySelector('.menu-starter > button')
  const searchTextFieldEl = headerEl.querySelector('.textfield')
  const searchCancelEl = headerEl.querySelector('.search-canceler')
  const navMenuToggleEl = navEl.querySelector('.menu-toggler')
  const navMenuShadowEl = navEl.querySelector('.shadow')
  const navMenuEl = navEl.querySelector('#product-nav-menu')

  let scrollLockY = 0
  let searchFocusTimeoutId = 0
  let basketOpenMode = null
  let searchOpenMode = null

  /* ==========================================================================
     Search focus modality state
     - 최근 입력 수단이 키보드인지, 마우스/터치인지 추적
     - 키보드로 검색창에 진입했을 때만 .is-keyboard-focus 클래스 부여
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

  const setSearchOpenMode = (mode = null) => {
    searchOpenMode = mode
  }

  const setBasketOpenMode = (mode = null) => {
    basketOpenMode = mode
  }

  const isKeyboardBasketSession = () =>
    basketOpenMode === 'keyboard' && basketEl?.classList.contains('show')

  const isKeyboardSearchSession = () =>
    searchOpenMode === 'keyboard' && headerEl.classList.contains('searching')

  const isPointerSearchSession = () =>
    searchOpenMode === 'pointer' && headerEl.classList.contains('searching')

  const syncInteractiveStates = () => {
    const isBasketOpen = basketEl?.classList.contains('show') ?? false
    const isSearchOpen = headerEl.classList.contains('searching')
    const isHeaderMenuOpen = headerEl.classList.contains('menuing')
    const isNavMenuOpen = navEl.classList.contains('menuing')
    const isSearchPanelVisible = isSearchOpen || (isMobileViewport() && isHeaderMenuOpen)

    setExpandedState(basketStarterEl, isBasketOpen)
    setExpandedState(searchStarterEl, isSearchOpen)
    setExpandedState(menuStarterEl, isHeaderMenuOpen)
    setExpandedState(navMenuToggleEl, isNavMenuOpen)
    setHiddenState(basketEl, !isBasketOpen)
    setHiddenState(searchWrapEl, !isSearchPanelVisible)
    setHiddenState(navMenuEl, isMobileViewport() ? !isNavMenuOpen : false)

    if (basketStarterEl) {
      basketStarterEl.setAttribute('aria-label', isBasketOpen ? '장바구니 닫기' : '장바구니 열기')
    }

    if (searchStarterEl) {
      searchStarterEl.setAttribute('aria-label', isSearchOpen ? '검색 닫기' : '검색 열기')
    }

    if (menuStarterEl) {
      menuStarterEl.setAttribute('aria-label', isHeaderMenuOpen ? '전역 메뉴 닫기' : '전역 메뉴 열기')
    }

    if (navMenuToggleEl) {
      navMenuToggleEl.setAttribute('aria-label', isNavMenuOpen ? '제품 메뉴 닫기' : '제품 메뉴 열기')
    }
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
      headerEl.classList.contains('searching--mobile') ||
      (isMobileViewport() && navEl.classList.contains('menuing'))

    shouldLock ? lockScroll() : unlockScroll()
    syncInteractiveStates()
  }

  const hideBasket = () => {
    basketEl?.classList.remove('show')
    setBasketOpenMode()
    syncInteractiveStates()
  }

  const showBasket = ({ mode = 'pointer' } = {}) => {
    hideSearch()
    hideNavMenu()
    closeHeaderMenu()
    closeMobileSearch()
    basketEl?.classList.add('show')
    setBasketOpenMode(mode)
    syncInteractiveStates()
  }

  const closeHeaderMenu = () => {
    headerEl.classList.remove('menuing')
    syncInteractiveStates()
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

  const hideSearch = ({ clearInput = true } = {}) => {
    clearSearchFocusTimer()
    headerEl.classList.remove('searching')
    setTransitionDelays(headerMenuEls, { reverse: true })
    setTransitionDelays(searchDelayEls, { reverse: true })

    if (clearInput && searchInputEl) {
      searchInputEl.value = ''
    }

    clearSearchKeyboardFocusState()
    setSearchOpenMode()
    syncScrollLock()
  }

  const closeAllNavigationLayers = ({ preserveSearch = false } = {}) => {
    hideBasket()
    hideNavMenu()
    closeHeaderMenu()
    closeMobileSearch()

    if (preserveSearch) {
      syncScrollLock()
      return
    }

    hideSearch()
  }

  const showSearch = ({ mode = 'pointer' } = {}) => {
    if (!searchInputEl) {
      return
    }

    hideBasket()
    hideNavMenu()
    closeHeaderMenu()
    closeMobileSearch()
    headerEl.classList.add('searching')
    setTransitionDelays(headerMenuEls, { reverse: true })
    setTransitionDelays(searchDelayEls)
    setSearchOpenMode(mode)
    syncScrollLock()
    clearSearchFocusTimer()
    clearSearchKeyboardFocusState()

    searchFocusTimeoutId = window.setTimeout(() => {
      focusSearchInput()
    }, SEARCH_CONFIG.focusDelay)
  }

  const showNavMenu = () => {
    hideBasket()
    hideSearch()
    closeHeaderMenu()
    closeMobileSearch()
    navEl.classList.add('menuing')
    syncScrollLock()
  }

  const toggleHeaderMenu = () => {
    hideBasket()
    hideNavMenu()
    closeMobileSearch()

    if (headerEl.classList.contains('menuing')) {
      closeHeaderMenu()

      if (searchInputEl) {
        searchInputEl.value = ''
      }
    } else {
      hideSearch()
      headerEl.classList.add('menuing')
    }

    syncScrollLock()
  }

  const openMobileSearch = () => {
    if (!searchInputEl) {
      return
    }

    hideBasket()
    hideNavMenu()
    headerEl.classList.add('menuing', 'searching--mobile')
    syncScrollLock()
    clearSearchKeyboardFocusState()
    focusSearchInput()
  }

  const handleSearchWrapFocusOut = (event) => {
    if (!isKeyboardSearchSession()) {
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

      hideSearch()
    })
  }

  const handleSearchScrollClose = () => {
    if (!isPointerSearchSession()) {
      return
    }

    hideSearch()
  }

  const handleBasketWrapFocusOut = (event) => {
    if (!isKeyboardBasketSession()) {
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

      hideBasket()
    })
  }

  const handleBasketScrollClose = () => {
    if (!basketEl?.classList.contains('show')) {
      return
    }

    hideBasket()
  }

  /* 최근 입력 수단 추적
     - Tab / Enter / Space / 방향키 등 키보드 탐색 가능성이 높은 입력이면 true
     - 마우스/포인터/터치는 false */
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
  window.addEventListener('scroll', handleSearchScrollClose, { passive: true })
  window.addEventListener('scroll', handleBasketScrollClose, { passive: true })

  searchInputEl?.addEventListener('focus', () => {
    applySearchKeyboardFocusState()
  })

  searchInputEl?.addEventListener('blur', () => {
    clearSearchKeyboardFocusState()
  })

  basketStarterEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    basketEl?.classList.contains('show')
      ? hideBasket()
      : showBasket({ mode: isKeyboardInteraction ? 'keyboard' : 'pointer' })
  })

  basketEl?.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  basketWrapEl?.addEventListener('focusout', handleBasketWrapFocusOut)

  searchStarterEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    showSearch({ mode: isKeyboardInteraction ? 'keyboard' : 'pointer' })
  })

  searchCloserEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    hideSearch()
  })

  searchWrapEl?.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  searchWrapEl?.addEventListener('focusout', handleSearchWrapFocusOut)

  searchShadowEl?.addEventListener('click', () => {
    hideSearch()
  })

  searchQuickLinkEls.forEach((element, index) => {
    const isLastQuickLink = index === searchQuickLinkEls.length - 1

    element.addEventListener('keydown', (event) => {
      if (
        !isKeyboardSearchSession() ||
        !isLastQuickLink ||
        event.key !== 'Tab' ||
        event.shiftKey
      ) {
        return
      }

      event.preventDefault()
      hideSearch()
      basketStarterEl?.focus()
    })
  })

  basketMenuLinkEls.forEach((element, index) => {
    const isLastBasketLink = index === basketMenuLinkEls.length - 1

    element.addEventListener('keydown', (event) => {
      if (
        !isKeyboardBasketSession() ||
        !isLastBasketLink ||
        event.key !== 'Tab' ||
        event.shiftKey
      ) {
        return
      }

      event.preventDefault()

      const nextFocusableEl = getNextFocusableElement(element)

      hideBasket()
      nextFocusableEl?.focus()
    })
  })

  menuStarterEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    toggleHeaderMenu()
  })

  searchTextFieldEl?.addEventListener('click', (event) => {
    if (!isMobileViewport()) {
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
    closeAllNavigationLayers()
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllNavigationLayers()
    }
  })

  window.addEventListener('resize', () => {
    if (isMobileViewport()) {
      headerEl.classList.remove('searching')
    } else {
      closeHeaderMenu()
      closeMobileSearch()
      hideNavMenu()
    }

    clearSearchKeyboardFocusState()
    syncScrollLock()
  })

  syncInteractiveStates()
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
