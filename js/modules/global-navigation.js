import { GLOBAL_NAVIGATION_ITEMS } from '../common/config.js'
import { bodyEl } from '../common/dom.js'

const getNavigationHref = (path) => {
  const isErrorPage = bodyEl.classList.contains('error-page-body')

  if (isErrorPage) {
    return '/index.html'
  }

  return path
}

const createMenuLink = (item) => {
  const listItemEl = document.createElement('li')
  const linkEl = document.createElement('a')

  linkEl.href = getNavigationHref(item.path)
  linkEl.textContent = item.label

  if (item.isCurrent) {
    linkEl.setAttribute('aria-current', 'page')
  }

  listItemEl.append(linkEl)
  return listItemEl
}

const createMobileMenuLink = (item, index) => {
  const listItemEl = createMenuLink(item)

  listItemEl.className = 'mobile-menu-item mobile-panel-item'
  listItemEl.style.setProperty('--mobile-menu-item-index', index)
  listItemEl.style.setProperty('--mobile-panel-item-index', index)

  return listItemEl
}

const createAppleLogoItem = () => {
  const listItemEl = document.createElement('li')
  const linkEl = document.createElement('a')

  listItemEl.className = 'apple-logo'
  linkEl.href = '/index.html'
  linkEl.textContent = 'Apple'
  listItemEl.append(linkEl)

  return listItemEl
}

export const initGlobalNavigationMenus = () => {
  const globalMenuEl = document.querySelector('[data-global-menu]')
  const mobileMenuEl = document.querySelector('[data-mobile-menu]')

  if (globalMenuEl) {
    const desktopMenuFragment = document.createDocumentFragment()

    desktopMenuFragment.append(createAppleLogoItem())

    GLOBAL_NAVIGATION_ITEMS.forEach((item) => {
      desktopMenuFragment.append(createMenuLink(item))
    })

    globalMenuEl.prepend(desktopMenuFragment)
  }

  if (mobileMenuEl) {
    mobileMenuEl.innerHTML = ''

    GLOBAL_NAVIGATION_ITEMS.forEach((item, index) => {
      mobileMenuEl.append(createMobileMenuLink(item, index))
    })
  }
}
