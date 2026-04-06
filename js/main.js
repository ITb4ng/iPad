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

  const basketStarterEl = headerEl.querySelector('.basket-starter')
  const basketEl = basketStarterEl?.querySelector('.basket')
  const headerMenuEls = [...headerEl.querySelectorAll('ul.menu > li')]
  const searchWrapEl = headerEl.querySelector('.search-wrap')
  const searchStarterEl = headerEl.querySelector('.search-starter')
  const searchCloserEl = searchWrapEl?.querySelector('.search-closer')
  const searchShadowEl = searchWrapEl?.querySelector('.shadow')
  const searchInputEl = searchWrapEl?.querySelector('input')
  const searchDelayEls = searchWrapEl ? [...searchWrapEl.querySelectorAll('li')] : []
  const menuStarterEl = headerEl.querySelector('.menu-starter')
  const searchTextFieldEl = headerEl.querySelector('.textfield')
  const searchCancelEl = headerEl.querySelector('.search-canceler')
  const navMenuToggleEl = navEl.querySelector('.menu-toggler')
  const navMenuShadowEl = navEl.querySelector('.shadow')

  let scrollLockY = 0
  let searchFocusTimeoutId = 0

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
  }

  const hideBasket = () => {
    basketEl?.classList.remove('show')
  }

  const showBasket = () => {
    hideSearch()
    hideNavMenu()
    closeHeaderMenu()
    closeMobileSearch()
    basketEl?.classList.add('show')
  }

  const closeHeaderMenu = () => {
    headerEl.classList.remove('menuing')
  }

  const closeMobileSearch = () => {
    headerEl.classList.remove('searching--mobile')
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

  const showSearch = () => {
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
    syncScrollLock()
    clearSearchFocusTimer()

    searchFocusTimeoutId = window.setTimeout(() => {
      searchInputEl.focus()
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
    searchInputEl.focus()
  }

  basketStarterEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    basketEl?.classList.contains('show') ? hideBasket() : showBasket()
  })

  basketEl?.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  searchStarterEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    showSearch()
  })

  searchCloserEl?.addEventListener('click', (event) => {
    event.stopPropagation()
    hideSearch()
  })

  searchWrapEl?.addEventListener('click', (event) => {
    event.stopPropagation()
  })

  searchShadowEl?.addEventListener('click', () => {
    hideSearch()
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

    syncScrollLock()
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
    const itemEl = document.createElement('div')
    const colorList = ipad.colors
      .map((color) => `<li style="background-color: ${color};"></li>`)
      .join('')

    itemEl.classList.add('item')
    itemEl.innerHTML = /* html */ `
      <div class="thumbnail">
        <img src="${ipad.thumbnail}" alt="${ipad.name}" />
      </div>
      <ul class="colors">
        ${colorList}
      </ul>
      <h3 class="name">${ipad.name}</h3>
      <p class="tagline">${ipad.tagline}</p>
      <p class="price">₩${ipad.price.toLocaleString('ko-KR')}&nbsp;부터</p>
      <button class="btn">구입하기</button>
      <a href="${ipad.url}" class="link">더 알아보기</a>
    `

    itemsEl.append(itemEl)
  })
}

const initFooterNavigation = () => {
  const navigationsEl = document.querySelector('footer .navigations')
  const thisYearEl = document.querySelector('span.this-year')

  if (navigationsEl) {
    navigationsEl.innerHTML = ''

    navigations.forEach((navigation) => {
      const mapEl = document.createElement('div')
      const mapList = navigation.maps
        .map(
          (map) => /* html */ `
            <li>
              <a href="${map.url}">${map.name}</a>
            </li>
          `
        )
        .join('')

      mapEl.classList.add('map')
      mapEl.innerHTML = /* html */ `
        <h3>
          <span class="text">${navigation.title}</span>
          <span class="icon">+</span>
        </h3>
        <ul>
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

  mapEls.forEach((element) => {
    const headingEl = element.querySelector('h3')

    headingEl?.addEventListener('click', () => {
      if (window.innerWidth > 1000) {
        return
      }

      element.classList.toggle('active')
    })
  })
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
