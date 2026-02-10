import { startPolling, stopPolling } from "./polling/polling.js"
import { startSSE, stopSSE } from "./sse/sse.js"

export const observer = new MutationObserver(entries => {
  entries.forEach(entry => {
    entry.addedNodes.forEach(element => {
      if(element.nodeType !== 1) return
      if(element.matches("[data-polling]")) {
        startPolling(element)
        element.querySelectorAll("[data-polling]").forEach(el => startPolling(el))
      }
      if(element.matches("[data-sse]")) {
        startSSE(element)
        element.querySelectorAll("[data-sse]").forEach(el => startSSE(el))
      }
    })
    entry.removedNodes.forEach(element => {
      if(element.nodeType !== 1) return
      if(element.matches("[data-polling]")) {
        stopPolling(element)
        element.querySelectorAll("[data-polling]").forEach(el => stopPolling(el))
      }
      if(element.matches("[data-sse]")) {
        stopSSE(element)
        element.querySelectorAll("[data-sse]").forEach(el => stopSSE(el))
      }
    })
  })
})