import { prefersReducedMotion } from '../common/dom.js'

const supportsIntersectionObserver = () => typeof window.IntersectionObserver === 'function'

const ensureDeferredVideoLoaded = (videoEl) => {
  if (!(videoEl instanceof HTMLVideoElement)) {
    return false
  }

  if (videoEl.dataset.srcLoaded === 'true') {
    return true
  }

  const deferredSrc = videoEl.dataset.src
  if (!deferredSrc) {
    return false
  }

  videoEl.src = deferredSrc
  videoEl.load()
  videoEl.dataset.srcLoaded = 'true'
  return true
}

export const initStageVideoControls = () => {
  const stageVideoEl = document.querySelector('.stage .camera__stage-video')
  const stageStartframeEl = document.querySelector('.stage [data-stage-video-startframe]')
  const playBtnEl = document.querySelector('.stage .controller--play')
  const pauseBtnEl = document.querySelector('.stage .controller--pause')
  const stageSectionEl = document.querySelector('.camera .stage')

  if (!stageVideoEl || !playBtnEl || !pauseBtnEl || !stageSectionEl) {
    return
  }

  const canUseIntersectionObserver = supportsIntersectionObserver()
  let hasVideoLoaded = false
  let hasAutoPlayed = false
  let hasPlaybackEnded = false
  let hasPendingAutoplay = false

  const syncStageVisualState = (isPlaying) => {
    stageSectionEl.classList.toggle('is-stage-video-active', isPlaying)

    if (stageStartframeEl instanceof HTMLImageElement) {
      stageStartframeEl.toggleAttribute('hidden', isPlaying)
    }
  }

  const syncControls = (isPlaying) => {
    playBtnEl.classList.toggle('hide', isPlaying)
    pauseBtnEl.classList.toggle('hide', !isPlaying)
  }

  const ensureVideoLoaded = () => {
    if (hasVideoLoaded) {
      return
    }

    hasVideoLoaded = ensureDeferredVideoLoaded(stageVideoEl)
  }

  const playStageVideo = ({ auto = false } = {}) => {
    if (hasPlaybackEnded && auto) {
      return
    }

    ensureVideoLoaded()
    hasPendingAutoplay = true

    if (hasPlaybackEnded && !auto) {
      stageVideoEl.currentTime = 0
      hasPlaybackEnded = false
    }

    if (stageVideoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return
    }

    const playPromise = stageVideoEl.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        syncControls(false)
      })
      return
    }

    syncControls(true)
  }

  stageVideoEl.addEventListener('play', () => {
    hasPendingAutoplay = false
    syncStageVisualState(true)
    syncControls(true)
  })

  stageVideoEl.addEventListener('pause', () => {
    syncControls(false)
  })

  stageVideoEl.addEventListener('ended', () => {
    hasPlaybackEnded = true
    hasPendingAutoplay = false
    stageVideoEl.currentTime = 0
    syncStageVisualState(false)
    syncControls(false)
  })

  stageVideoEl.addEventListener('loadeddata', () => {
    if (!hasPendingAutoplay || hasPlaybackEnded) {
      return
    }

    playStageVideo({ auto: true })
  })

  playBtnEl.addEventListener('click', () => {
    playStageVideo()
  })

  pauseBtnEl.addEventListener('click', () => {
    stageVideoEl.pause()
  })

  syncStageVisualState(false)
  syncControls(false)

  if (!canUseIntersectionObserver) {
    playStageVideo({ auto: true })
    hasAutoPlayed = true
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.35 || hasAutoPlayed) {
        return
      }

      playStageVideo({ auto: true })
      hasAutoPlayed = true
      observer.unobserve(entry.target)
    })
  }, {
    threshold: [0.35, 0.6]
  })

  observer.observe(stageSectionEl)
}

export const initDesignVideoTransition = () => {
  const videoShellEls = [...document.querySelectorAll('[data-design-video-shell]')]
  const canUseIntersectionObserver = supportsIntersectionObserver()

  videoShellEls.forEach((shellEl) => {
    const videoEl = shellEl.querySelector('[data-design-video]')
    const endframeEl = shellEl.querySelector('[data-design-video-endframe]')
    const transitionMode = shellEl.getAttribute('data-design-video-mode')
    let hasPlaybackStarted = false
    let hasPlaybackEnded = false
    let hasVideoLoaded = false
    let hasPendingAutoplay = false

    if (!(videoEl instanceof HTMLVideoElement)) {
      return
    }

    const prepareEndframe = async () => {
      if (!(endframeEl instanceof HTMLImageElement)) {
        return
      }

      if (typeof endframeEl.decode === 'function') {
        try {
          await endframeEl.decode()
        } catch (error) {
          // Ignore decode failures and fall back to the normal loaded state.
        }
      }
    }

    if (prefersReducedMotion()) {
      shellEl.classList.add('is-reduced-motion')
      videoEl.pause()
      videoEl.style.visibility = 'hidden'
      return
    }

    const showEndframe = async () => {
      hasPlaybackEnded = true
      await prepareEndframe()
      if (transitionMode === 'swap') {
        shellEl.classList.add('is-ended')
        videoEl.pause()
        videoEl.style.visibility = 'hidden'
        return
      }

      window.requestAnimationFrame(() => {
        shellEl.classList.add('is-ended')
        videoEl.pause()
      })
    }

    videoEl.currentTime = 0
    void prepareEndframe()
    videoEl.addEventListener('ended', showEndframe, { once: true })

    const ensureVideoLoaded = () => {
      if (hasVideoLoaded) {
        return
      }

      hasVideoLoaded = ensureDeferredVideoLoaded(videoEl)
    }

    const startPlayback = () => {
      if (hasPlaybackEnded) {
        return
      }

      ensureVideoLoaded()
      hasPendingAutoplay = true

      if (videoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return
      }

      hasPlaybackStarted = true
      videoEl.style.visibility = ''

      const playbackPromise = videoEl.play()
      if (playbackPromise && typeof playbackPromise.catch === 'function') {
        playbackPromise.catch(() => {
          hasPlaybackStarted = false
        })
      }
    }

    videoEl.addEventListener('play', () => {
      hasPendingAutoplay = false
    })

    videoEl.addEventListener('loadeddata', () => {
      if (!hasPendingAutoplay || hasPlaybackEnded) {
        return
      }

      startPlayback()
    })

    if (!canUseIntersectionObserver) {
      startPlayback()
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (hasPlaybackEnded) {
          observer.unobserve(entry.target)
          return
        }

        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          startPlayback()
          return
        }

        if (hasPlaybackStarted) {
          videoEl.pause()
        }
      })
    }, {
      threshold: [0.35, 0.6]
    })

    observer.observe(shellEl)
  })
}
