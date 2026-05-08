import ipads from '../../data/ipads.js'
import { toProjectUrl } from '../shared/dom.js'

const createButtonLink = (ipad, label, className) => {
  const linkEl = document.createElement('a')

  linkEl.href = toProjectUrl(ipad.url)
  linkEl.className = className
  linkEl.textContent = label
  linkEl.setAttribute('aria-label', `${ipad.name} ${label}`)

  return linkEl
}

const createColorList = (ipad) => {
  const colorListEl = document.createElement('ul')

  colorListEl.className = 'colors'
  colorListEl.setAttribute('aria-label', `${ipad.name} 색상`)

  ipad.colors.forEach((color) => {
    const colorEl = document.createElement('li')

    colorEl.style.backgroundColor = color
    colorEl.setAttribute('aria-hidden', 'true')
    colorListEl.append(colorEl)
  })

  return colorListEl
}

const createCompareItem = (ipad) => {
  const itemEl = document.createElement('article')
  const thumbnailEl = document.createElement('div')
  const imageEl = document.createElement('img')
  const nameEl = document.createElement('h3')
  const taglineEl = document.createElement('p')
  const priceEl = document.createElement('p')

  itemEl.className = 'item'
  itemEl.setAttribute('role', 'listitem')

  thumbnailEl.className = 'thumbnail'
  imageEl.src = ipad.thumbnail
  imageEl.alt = ipad.name
  thumbnailEl.append(imageEl)

  nameEl.className = 'name'
  nameEl.textContent = ipad.name

  taglineEl.className = 'tagline'
  taglineEl.textContent = ipad.tagline

  priceEl.className = 'price'
  priceEl.innerHTML = `₩${ipad.price.toLocaleString('ko-KR')}&nbsp;부터`

  itemEl.append(
    thumbnailEl,
    createColorList(ipad),
    nameEl,
    taglineEl,
    priceEl,
    createButtonLink(ipad, '구입하기', 'btn'),
    createButtonLink(ipad, '더 알아보기', 'link')
  )

  return itemEl
}

export const initCompareSection = () => {
  const itemsEl = document.querySelector('section.compare .items')

  if (!itemsEl) {
    return
  }

  itemsEl.innerHTML = ''

  ipads.forEach((ipad) => {
    itemsEl.append(createCompareItem(ipad))
  })
}
