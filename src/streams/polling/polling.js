import { $fetch } from "../../core/fetch.js"
import { swap } from "../../core/swap.js"

const polling_controller = new WeakMap()
const active_elements = new Set()

export function bootstrapPolling() {
  const elements = document.querySelectorAll("[data-polling]")
  elements.forEach(element => startPolling(element))
}

export function startPolling(element) {
  if(polling_controller.has(element)) return
  
  const endpoint = element.dataset.polling
  if(!endpoint) throw new Error("[data-polling] missing required attribute: data-polling")
  const rawInterval = element.dataset.refresh || "5s"
  const match = rawInterval.match(/^(\d+(\.\d+)?)s$/)
  if(!match) {
    console.error(`[Briz.js] Invalid timeout format: "${rawInterval}". Format must be a number followed by 's'. Request aborted.`)
    return
  }
  const interval = parseFloat(match[1]) * 1000
  
  async function poll() {
    if(!active_elements.has(element)) return
    
    try {
      const html = await $fetch(endpoint, { method: "GET" })
      if(html) swap(html)
    } catch (err) {
      console.error("Polling request failed", err)
    }
    const timeoutId = setTimeout(poll, interval)
    polling_controller.set(element, timeoutId)
  }

  active_elements.add(element)
  poll()
}

export function visibilityHandler() {
  active_elements.forEach(element => {
    if(document.hidden) {
      stopPolling(element, false)
    } else {
      startPolling(element)
    }
  })
}

export function stopPolling(element, isNotPause = true) {
  const polling = polling_controller.get(element)
  if(!polling) return
  clearTimeout(polling)
  polling_controller.delete(element)
  if(isNotPause) active_elements.delete(element)
}
