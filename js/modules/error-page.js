import { bodyEl } from '../shared/dom.js'

const HOME_URL = '/index.html'

const moveToPreviousPage = () => {
  const hasPreviousPage = window.history.length > 1
  const cameFromAnotherPage = document.referrer && document.referrer !== window.location.href

  if (hasPreviousPage && cameFromAnotherPage) {
    window.history.back()
    return
  }

  window.location.assign(HOME_URL)
}

const connectHomeLinks = () => {
  const homeLinkEls = document.querySelectorAll('[data-error-home]')

  homeLinkEls.forEach((linkEl) => {
    linkEl.setAttribute('href', HOME_URL)
  })
}

const connectHomeSectionLinks = () => {
  const sectionLinkEls = document.querySelectorAll('[data-error-home-section]')

  sectionLinkEls.forEach((linkEl) => {
    const sectionId = linkEl.getAttribute('data-error-home-section')

    if (sectionId) {
      linkEl.setAttribute('href', `${HOME_URL}#${sectionId}`)
      return
    }

    linkEl.setAttribute('href', HOME_URL)
  })
}

const connectFooterLinksToHome = () => {
  const footerLinkEls = document.querySelectorAll('footer .navigations a[href]')

  footerLinkEls.forEach((linkEl) => {
    linkEl.setAttribute('href', HOME_URL)
  })
}

export const initErrorPage = () => {
  if (!bodyEl.classList.contains('error-page-body')) {
    return
  }

  const historyBackButtonEl = document.querySelector('[data-history-back]')

  connectHomeLinks()
  connectHomeSectionLinks()
  connectFooterLinksToHome()

  if (historyBackButtonEl) {
    historyBackButtonEl.addEventListener('click', moveToPreviousPage)
  }
}
