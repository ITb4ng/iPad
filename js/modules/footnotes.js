const HIGHLIGHT_CLASS = 'is-footnote-highlight'
const HIGHLIGHT_DURATION = 1800

let activeTarget = null
let clearHighlightTimer = 0

const clearFootnoteHashFromUrl = () => {
  const { pathname, search, hash } = window.location

  if (!hash || !hash.startsWith('#footnote')) {
    return
  }

  window.history.replaceState(null, '', `${pathname}${search}`)
}

const clearFootnoteHighlight = () => {
  if (clearHighlightTimer) {
    window.clearTimeout(clearHighlightTimer)
    clearHighlightTimer = 0
  }

  if (activeTarget instanceof HTMLElement) {
    activeTarget.classList.remove(HIGHLIGHT_CLASS)
  }

  activeTarget = null
}

const focusFootnoteTarget = () => {
  const hash = window.location.hash

  if (!hash || !hash.startsWith('#footnote')) {
    clearFootnoteHighlight()
    return
  }

  const target = document.querySelector(`.warning ${hash}`)

  if (!(target instanceof HTMLElement)) {
    clearFootnoteHighlight()
    return
  }

  clearFootnoteHighlight()
  activeTarget = target
  target.classList.add(HIGHLIGHT_CLASS)

  window.requestAnimationFrame(() => {
    try {
      target.focus({ preventScroll: true })
    } catch {
      target.focus()
    }
  })

  window.setTimeout(clearFootnoteHashFromUrl, 80)

  clearHighlightTimer = window.setTimeout(() => {
    target.classList.remove(HIGHLIGHT_CLASS)

    if (activeTarget === target) {
      activeTarget = null
      clearHighlightTimer = 0
    }
  }, HIGHLIGHT_DURATION)
}

export const initFootnoteTargets = () => {
  focusFootnoteTarget()
  window.addEventListener('hashchange', focusFootnoteTarget)
}
