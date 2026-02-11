import { $fetch } from "./core/fetch.js"
import { init } from "./core/init.js"
import { bootstrapPolling } from "./streams/polling/polling.js"
import { bootstrapSSE } from "./streams/sse/sse.js"

export { $fetch }

function start() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init()
      bootstrapPolling()
      bootstrapSSE()
    })
  } else {
    init()
    bootstrapPolling()
    bootstrapSSE()
  }
}

start()