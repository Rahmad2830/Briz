import { performSwap } from "../../core/swap.js"

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
  const eventsLists = element.dataset.event || "message"
  const withCredentials = element.hasAttribute("data-credentials")
  const events = eventsLists.split(",").map(e => e.trim())
  
  const eventSource = new EventSource(endpoint, { withCredentials })
  const handler = (e) => {
    if(e.data) performSwap(e.data)
  }
  events.forEach(event => {
    eventSource.addEventListener(event, handler)
  })
  eventSource.onerror = (err) => {
    console.error("[data-sse] SSE connection error", err)
  }
  sse_controllers.set(element, { eventSource, handler, events })
}

export function stopSSE(element) {
  const source = sse_controllers.get(element)
  if(!source) return
  source.events.forEach(event => {
    source.eventSource.removeEventListener(event, source.handler)
  })
  source.eventSource.close()
  sse_controllers.delete(element)
}