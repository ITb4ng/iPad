import navigations from '../../data/navigations.js'
import { isMobileViewport, setExpandedState, toProjectUrl } from '../shared/dom.js'

const createFooterMap = (navigation, index) => {
  const mapEl = document.createElement('section')
  const titleEl = document.createElement('h3')
  const toggleEl = document.createElement('button')
  const textEl = document.createElement('span')
  const iconEl = document.createElement('span')
  const listEl = document.createElement('ul')
  const listId = `footer-navigation-list-${index + 1}`

  mapEl.className = 'map'
  toggleEl.type = 'button'
  toggleEl.className = 'map-toggle'
  toggleEl.setAttribute('aria-expanded', 'false')
  toggleEl.setAttribute('aria-controls', listId)

  textEl.className = 'text'
  textEl.textContent = navigation.title

  iconEl.className = 'icon'
  iconEl.textContent = '+'
  iconEl.setAttribute('aria-hidden', 'true')

  listEl.id = listId

  navigation.maps.forEach((map) => {
    const itemEl = document.createElement('li')
    const linkEl = document.createElement('a')

    linkEl.href = toProjectUrl(map.url)
    linkEl.textContent = map.name
    itemEl.append(linkEl)
    listEl.append(itemEl)
  })

  toggleEl.append(textEl, iconEl)
  titleEl.append(toggleEl)
  mapEl.append(titleEl, listEl)

  return mapEl
}

const setFooterYear = () => {
  const thisYearEl = document.querySelector('span.this-year')

  if (thisYearEl) {
    thisYearEl.textContent = new Date().getFullYear()
  }
}

const renderFooterNavigation = () => {
  const navigationsEl = document.querySelector('footer .navigations')

  if (!navigationsEl) {
    return []
  }

  navigationsEl.innerHTML = ''

  navigations.forEach((navigation, index) => {
    navigationsEl.append(createFooterMap(navigation, index))
  })

  return [...navigationsEl.querySelectorAll('.map')]
}

const syncFooterNavigationState = (mapEls) => {
  const isMobileFooter = isMobileViewport()

  mapEls.forEach((mapEl) => {
    const toggleEl = mapEl.querySelector('.map-toggle')
    const listEl = mapEl.querySelector('ul')
    const isExpanded = isMobileFooter ? mapEl.classList.contains('active') : true

    mapEl.classList.toggle('active', isMobileFooter && isExpanded)
    setExpandedState(toggleEl, isExpanded)

    if (listEl) {
      listEl.hidden = !isExpanded
    }
  })
}

export const initFooterNavigation = () => {
  setFooterYear()

  const mapEls = renderFooterNavigation()

  mapEls.forEach((mapEl) => {
    const toggleEl = mapEl.querySelector('.map-toggle')

    toggleEl.addEventListener('click', () => {
      if (!isMobileViewport()) {
        return
      }

      mapEl.classList.toggle('active')
      syncFooterNavigationState(mapEls)
    })
  })

  window.addEventListener('resize', () => {
    syncFooterNavigationState(mapEls)
  })

  syncFooterNavigationState(mapEls)
}
