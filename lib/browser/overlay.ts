type Overlay = {element: HTMLElement; close: (restoreFocus?: boolean, dismiss?: boolean) => void}

let active: Overlay | undefined

const focusableSelector = 'a[href],button,input,select,textarea,[tabindex],[contenteditable="true"]'

export function registerOverlay(element: HTMLElement, options: {
  triggers?: HTMLElement[]
  initialFocus?: string
  onDismiss?: () => void
} = {}) {
  let previousFocus: HTMLElement | null = null
  let previousOverflow = ''
  let previousScrollLock = false
  const previousTabIndex = element.getAttribute('tabindex')
  const focusable = () => [...element.querySelectorAll<HTMLElement>(focusableSelector)]
    .filter(node => node.tabIndex >= 0 && !node.matches(':disabled,[hidden],[aria-hidden="true"]') && node.getClientRects().length > 0)
  const focus = () => {
    const preferred = options.initialFocus ? element.querySelector<HTMLElement>(options.initialFocus) : null
    const target = preferred ?? focusable()[0] ?? element
    target.focus({preventScroll: true})
  }
  const onFocus = (event: FocusEvent) => {
    if (event.target instanceof Node && !element.contains(event.target)) focus()
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      const targets = focusable()
      const index = targets.indexOf(document.activeElement as HTMLElement)
      if (!targets.length || index < 0 || (event.shiftKey ? index === 0 : index === targets.length - 1)) {
        event.preventDefault()
        const target = (event.shiftKey ? targets.at(-1) : targets[0]) ?? element
        target.focus({preventScroll: true})
      }
    }
  }
  const close = (restoreFocus = true, dismiss = true) => {
    if (active !== overlay) return
    active = undefined
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('focusin', onFocus)
    element.classList.remove('open')
    element.setAttribute('aria-hidden', 'true')
    options.triggers?.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'))
    document.body.style.overflow = previousOverflow
    document.body.classList.toggle('menu-open', previousScrollLock)
    if (restoreFocus && previousFocus?.isConnected) previousFocus.focus({preventScroll: true})
    if (dismiss) options.onDismiss?.()
  }
  const overlay: Overlay = {element, close}

  return {
    open(trigger?: HTMLElement) {
      if (active === overlay) return
      const focused = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
      // A trigger inside the outgoing overlay will be hidden when this one closes.
      if (active) {
        const outgoing = active
        outgoing.close(true, false)
        previousFocus = focused && !outgoing.element.contains(focused) ? focused : document.activeElement as HTMLElement
      } else previousFocus = focused
      previousOverflow = document.body.style.overflow
      previousScrollLock = document.body.classList.contains('menu-open')
      active = overlay
      element.classList.add('open')
      element.setAttribute('aria-hidden', 'false')
      if (previousTabIndex === null) element.setAttribute('tabindex', '-1')
      options.triggers?.forEach(item => item.setAttribute('aria-expanded', String(item === trigger)))
      document.body.style.overflow = 'hidden'
      document.body.classList.add('menu-open')
      document.addEventListener('keydown', onKey)
      document.addEventListener('focusin', onFocus)
      focus()
      element.dispatchEvent(new Event('overlayopen'))
    },
    close: () => close(),
    dispose() {
      close(false, false)
      if (previousTabIndex === null) element.removeAttribute('tabindex')
    },
  }
}

export function isOverlayOpen() {
  return active !== undefined
}
