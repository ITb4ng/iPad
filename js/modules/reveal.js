export const initIntersectionReveal = () => {
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
