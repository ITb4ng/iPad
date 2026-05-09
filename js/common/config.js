// 공통 설정값
// 수정이 필요한 숫자나 문구는 이 파일에서 먼저 찾으면 됩니다.

export const BREAKPOINTS = {
  mobile: 740,
  heroMobile: 734
}

export const VIEWPORT_EDGE_THRESHOLD = 2

export const SEARCH_CONFIG = {
  staggerDuration: 0.4,
  focusDelay: 280
}

export const GLOBAL_PANEL_CONFIG = {
  openDuration: 240,
  closeDuration: 240,
  closeCleanupDuration: 290,
  hoverCloseArmDelay: 220,
  autoCloseGuardDuration: 280
}

export const MOBILE_MENU_CONFIG = {
  closeCleanupDuration: 320
}

export const HEADER_REVEAL_CONFIG = {
  activationOffset: 80,
  hideThreshold: 96,
  revealThreshold: 160,
  transitionDuration: 360
}

export const DEBUG = false

// 외부 Apple 경로를 이 프로젝트 안에서 실제로 이동 가능한 경로로 정리합니다.
export const PROJECT_ROUTE_ALIASES = {
  '/shop/buy-ipad': '/buy',
  '/shop/ipad/ipad-accessories': '/shop/accessories',
  '/shop/accessories/all': '/accessories',
  '/shop/trade-in': '/trade-in',
  '/shop/account/home': '/account',
  '/shop/order/list': '/orders',
  '/shop/browse/open/salespolicies': '/legal/sales',
  '/shop/goto/store': '/store',
  '/shop/goto/buy_accessories': '/accessories',
  '/shop/goto/account': '/account',
  '/shop/goto/special_deals': '/shop/special-deals',
  '/shop/goto/financing': '/financing',
  '/shop/goto/order/list': '/orders',
  '/shop/goto/help': '/support',
  '/ipad/compare': '/compare',
  '/ipad/cellular': '/learn/cellular',
  '/apple-pencil': '/learn/apple-pencil',
  '/ipad-keyboards': '/learn/keyboards',
  '/ipados': '/learn/ipados',
  '/app-store': '/learn/app-store',
  '/privacy': '/learn/privacy',
  '/accessibility': '/learn/accessibility',
  '/environment': '/learn/environment',
  '/apple-intelligence': '/learn/apple-intelligence',
  '/apple-vision-pro': '/learn/vision-pro',
  '/ios/feature-availability': '/support/feature-availability',
  '/legal/privacy': '/legal/privacy',
  '/legal/internet-services/terms/site.html': '/legal/terms',
  '/sitemap': '/sitemap'
}

export const GLOBAL_NAVIGATION_ITEMS = [
  { label: '스토어', path: '/store' },
  { label: 'Mac', path: '/mac' },
  { label: 'iPad', path: '/ipad', isCurrent: true },
  { label: 'iPhone', path: '/iphone' },
  { label: 'Watch', path: '/watch' },
  { label: 'AirPods', path: '/airpods' },
  { label: 'TV 및 홈', path: '/tv-home' },
  { label: 'Apple Store', path: '/apple-store' },
  { label: '액세서리', path: '/accessories' },
  { label: '고객지원', path: '/support' }
]

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ')

export const HERO_COPY = {
  words: ['쓰다.', '그리다.', '빠져들다.'],
  subhead: '화면 전체로 즐거운 iPad.',
  description:
    '이제 초고속 A16 칩 탑재. 그 어느 때보다 다재다능한 성능. 시선을 사로잡는 Liquid Retina 디스플레이는 화면 가장자리까지 아름답습니다.',
  highlights: ['27.6cm Liquid Retina 디스플레이', 'A16 칩', '128GB부터 시작'],
  links: ['iPad 11 구입하기', 'AR로 iPad 보기'],
  hardwareAlt: '블루, 핑크, 옐로, 실버 색상의 iPad와 Magic Keyboard Folio',
  hardwareLabels: ['Touch ID', 'A16 칩', '128GB부터']
}

export const HERO_TIMING = {
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
}

export const HERO_STATE_CLASSES = [
  'hero--logo-colored',
  'hero--logo-separated',
  'hero--logo-returning',
  'hero--copy-visible',
  'hero--details-visible',
  'hero--meta-visible'
]
