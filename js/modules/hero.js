import { BREAKPOINTS, HERO_COPY, HERO_STATE_CLASSES, HERO_TIMING } from '../shared/config.js'
import { setText, setTextList } from '../shared/dom.js'

export const initHeroIntro = () => {
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
