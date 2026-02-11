import { $fetch } from "./core/fetch.js"
import { init } from "./core/init.js"
import { bootstrapPolling } from "./streams/polling/polling.js"
import { bootstrapSSE } from "./streams/sse/sse.js"

export { $fetch }

document.addEventListener("DOMContentLoaded", () => {
  init()
  bootstrapPolling()
  bootstrapSSE()
})