import { $fetch } from "../../core/fetch.js"
import { swap } from "../../core/swap.js"

const polling_controller = new WeakMap()

export function bootstrapPolling() {
  const elements = document.querySelectorAll("[data-polling]")
  elements.forEach(element => startPolling(element))
}

export function startPolling(element) {
  if(polling_controller.has(element)) return
  
  const endpoint = element.dataset.polling
  if(!endpoint) return
  const rawInterval = element.dataset.refresh || "5s"
  const match = rawInterval.match(/^(\d+(\.\d+)?)s$/)
  if(!match) return
  const interval = parseFloat(match[1]) * 1000
  
  const timer = setInterval(async() => {
      const html = await $fetch(endpoint, { method: "GET" })
      if(html) swap(html)
    }, interval)
  polling_controller.set(element, timer)
}

export function stopPolling(element) {
  const polling = polling_controller.get(element)
  if(!polling) return
  clearInterval(polling)
  polling_controller.delete(element)
}