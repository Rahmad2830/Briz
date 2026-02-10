import { $fetch } from "./core/fetch.js"
import { init } from "./core/init.js"
import { bootstrapPolling } from "./streams/polling/polling.js"

export { $fetch }

document.addEventListener("DOMContentLoaded", () => {
  init()
  bootstrapPolling()
})