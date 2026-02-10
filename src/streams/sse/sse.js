import { swap } from "../../core/swap.js"

const sse_controllers = new WeakMap()

export function bootstrapSSE() {
  const elements = document.querySelectorAll("[data-sse]")
  elements.forEach(element => {
    try { startSSE(element) }
    catch(err) { console.error(err) }
  })
}

export function startSSE(element) {
  if(sse_controllers.has(element)) return
  
  const endpoint = element.dataset.sse
  if(!endpoint) throw new Error("[data-sse] missing required attribute: data-sse")
  const events = element.dataset.event
  if(!events) throw new Error("[data-sse] missing required attribute: data-event")
  const eventSource = new EventSource(endpoint, { withCredentials: true })
  const handler = (e) => {
    if(e.data) swap(e.data)
  }
  eventSource.addEventListener(events, handler)
  eventSource.onerror = (err) => { console.error("[data-sse] SSE connection error", err) }
  sse_controllers.set(element, { eventSource, handler, events })
}

export function stopSSE(element) {
  const source = sse_controllers.get(element)
  if(!source) return
  source.eventSource.removeEventListener(source.events, source.handler)
  source.eventSource.close()
  sse_controllers.delete(element)
}