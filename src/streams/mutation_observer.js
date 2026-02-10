import { startPolling, stopPolling } from "./polling/polling.js"

export const observer = new MutationObserver(entries => {
  entries.forEach(entry => {
    entry.addedNodes.forEach(element => {
      if(element.nodeType !== 1) return
      if(element.matches("[data-polling]")) startPolling(element)
      element.querySelectorAll("[data-polling]").forEach(el => startPolling(el))
    })
    entry.removedNodes.forEach(element => {
      if(element.nodeType !== 1) return
      if(element.matches("[data-polling]")) stopPolling(element)
      element.querySelectorAll("[data-polling]").forEach(el => stopPolling(el))
    })
  })
})