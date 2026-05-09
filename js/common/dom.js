import {
  BREAKPOINTS,
  FOCUSABLE_SELECTOR,
  GLOBAL_PANEL_CONFIG,
  PROJECT_ROUTE_ALIASES,
  SEARCH_CONFIG,
  VIEWPORT_EDGE_THRESHOLD
} from './config.js'

export const rootEl = document.documentElement
export const bodyEl = document.body
export const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

export const isMobileViewport = () => window.innerWidth <= BREAKPOINTS.mobile
export const prefersReducedMotion = () => reducedMotionQuery.matches
export const getPanelOpenDuration = () => (prefersReducedMotion() ? 20 : GLOBAL_PANEL_CONFIG.openDuration)
export const getPanelCloseCleanupDuration = () =>
  prefersReducedMotion() ? 20 : GLOBAL_PANEL_CONFIG.closeCleanupDuration
export const getSearchFocusDelay = () => (prefersReducedMotion() ? 0 : SEARCH_CONFIG.focusDelay)

let stableBrowserTopOffset = 0
let hasStableBrowserTopOffset = false

export const getBrowserTopOffset = () => Math.round(Math.max(window.visualViewport?.offsetTop ?? 0, 0))

export const getViewportHeight = () => window.visualViewport?.height ?? window.innerHeight

export const getWindowScrollY = () => Math.max(window.scrollY || window.pageYOffset || 0, 0)

export const getDocumentScrollHeight = () =>
  Math.max(
    rootEl.scrollHeight,
    rootEl.offsetHeight,
    document.body?.scrollHeight ?? 0,
    document.body?.offsetHeight ?? 0
  )

export const isNearDocumentBottom = () =>
  getDocumentScrollHeight() - (getWindowScrollY() + getViewportHeight()) <= VIEWPORT_EDGE_THRESHOLD

export const syncBrowserTopOffset = () => {
  const nextOffset = getBrowserTopOffset()

  if (isMobileViewport() && isNearDocumentBottom() && hasStableBrowserTopOffset) {
    rootEl.style.setProperty('--browser-top-offset', `${stableBrowserTopOffset}px`)
    return
  }

  stableBrowserTopOffset = nextOffset
  hasStableBrowserTopOffset = true
  rootEl.style.setProperty('--browser-top-offset', `${stableBrowserTopOffset}px`)
}

export const isFocusableElementVisible = (element) => {
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

export const getNextFocusableElement = (currentElement) => {
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

export const normalizeProjectPath = (path) => {
  if (!path) {
    return '/'
  }

  const sanitizedPath =
    path.length > 1 ? path.replace(/\/+$/, '') || '/' : path

  return PROJECT_ROUTE_ALIASES[sanitizedPath] ?? sanitizedPath
}

export const toProjectUrl = (url) => {
  if (!url) {
    return '#'
  }

  if (/^(#|tel:|mailto:)/.test(url)) {
    return url
  }

  if (url.startsWith('/kr/')) {
    return normalizeProjectPath(url.replace(/^\/kr/, '') || '/')
  }

  if (/^https?:\/\//.test(url)) {
    try {
      const parsedUrl = new URL(url)
      const host = parsedUrl.hostname.replace(/^www\./, '')

      if (host === 'appleid.apple.com') {
        return '/apple-id'
      }

      if (host === 'icloud.com') {
        return '/icloud'
      }

      if (host === 'locate.apple.com') {
        return '/reseller'
      }

      let nextPathname = parsedUrl.pathname || '/'

      if (host === 'support.apple.com') {
        nextPathname = nextPathname.replace(/^\/ko-kr(?=\/|$)/, '') || '/'
        return normalizeProjectPath(nextPathname === '/' ? '/support' : `/support${nextPathname}`)
      }

      if (host === 'apps.apple.com') {
        nextPathname = nextPathname.replace(/^\/kr(?=\/|$)/, '') || '/'
        return normalizeProjectPath(nextPathname === '/' ? '/app-store' : nextPathname)
      }

      if (host === 'apple.com') {
        nextPathname = nextPathname.replace(/^\/kr(?=\/|$)/, '') || '/'
        return normalizeProjectPath(nextPathname)
      }
    } catch (error) {
      return url
    }
  }

  return url.startsWith('/') ? normalizeProjectPath(url) : url
}

export const normalizeProjectAnchors = (root = document) => {
  const linkEls = [...root.querySelectorAll('a[href]')]

  linkEls.forEach((linkEl) => {
    const href = linkEl.getAttribute('href')

    if (!href) {
      return
    }

    linkEl.setAttribute('href', toProjectUrl(href))
  })
}

export const setExpandedState = (element, isExpanded) => {
  if (element) {
    element.setAttribute('aria-expanded', String(isExpanded))
  }
}

export const setHiddenState = (element, isHidden) => {
  if (element) {
    element.setAttribute('aria-hidden', String(isHidden))
  }
}

export const setText = (element, value) => {
  if (element) {
    element.textContent = value
  }
}

export const setTextList = (elements, values) => {
  elements.forEach((element, index) => {
    element.textContent = values[index] ?? ''
  })
}

export const setTransitionDelays = (
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
