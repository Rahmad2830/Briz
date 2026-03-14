export function dispatchZEvent(name, detail, target = document) {
  target.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true
  }))
}

const STATE_KEY = "__z"
function getZState() {
  return history.state?.[STATE_KEY] ?? {}
}
export function setZState(partial) {
  const current = history.state || {}
  const z = { ...getZState(), ...partial }
  history.replaceState({ ...current, [STATE_KEY]: z }, "", location.href)
}

export function withTransition(haveTransition = false, swapFn) {
  if(!document.startViewTransition || !haveTransition) {
    swapFn()
    return
  }

  document.startViewTransition(() => swapFn())
}

