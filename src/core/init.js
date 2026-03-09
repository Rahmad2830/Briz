import { $fetch, abortAllRequest } from "./fetch.js"
import { setZState, isInternal } from "./utils.js"
import { swap, swapPage } from "./swap.js"
import { observer } from "../streams/mutation_observer.js"
import { visibilityHandler } from "../streams/polling/polling.js"
import { prefetch, PAGES_CACHE } from "./prefetch.js"

let initialized = false

export function init() {
  if(initialized) return
  initialized = true
  if(!history.state?.__z) setZState({ scroll: { x: window.scrollX, y: window.scrollY } })
  
  history.scrollRestoration = "manual"
  document.addEventListener("click", handleNavigation)
  document.addEventListener("submit", handleForm)
  window.addEventListener("popstate", handlePopState)
  document.addEventListener("visibilitychange", visibilityHandler)
  document.addEventListener("pointerdown", handlePointerDown)
  observer.observe(document.body, {
    childList: true, subtree: true
  })
}

async function handleForm(e) {
  const element = e.target.closest("[data-ajax]")
  if(!element || element.tagName !== "FORM") return
  e.preventDefault()
  
  let bodyData = null
  let url = element.action
  if(!url) return
  let method = (element.method || "GET").toUpperCase()
  
  if(method === "GET") {
    const u = new URL(element.action, location.href)
    const formData = new FormData(element)
    for (const [key, value] of formData) {
      u.searchParams.set(key, value)
    }
    url = u.toString()
  } else if(method === "POST") {
    bodyData = new FormData(element)
  }
  
  try {
    const html = await $fetch(url, {
      method, body: bodyData,
      meta: { url, method, el: element }
    })
    if(html) swap(html)
  } catch (err) {
    console.error("Request failed", err)
    element.requestSubmit()
  }
}

function handlePointerDown(e) {
  const link = e.target.closest("a[data-nav]")
  if(link && isInternal(link.href)) prefetch(link.href)
}

async function handleNavigation(e) {
  if (
    e.metaKey || 
    e.ctrlKey || 
    e.shiftKey || 
    e.altKey || 
    e.button !== 0
  ) return
  
  const element = e.target.closest("[data-nav]")
  if(!element || element.tagName !== "A") return
  if (element.target === "_blank") return
  if (element.hasAttribute("download")) return
  if (element.rel?.includes("external")) return
  
  e.preventDefault()
  abortAllRequest()
  setZState({ scroll: { x: window.scrollX, y: window.scrollY } })
  const url = element.href
  if(!url) return
  
  try {
    const html = await prefetch(url)
    if(html) {
      history.pushState({ __z: {} }, "", url)
      swapPage(html)
      requestAnimationFrame(() => window.scrollTo({ top: 0 }))
      PAGES_CACHE.delete(url)
    }
  } catch (err) {
    console.error("Request failed", err)
    window.location.href = url
  }
}

async function handlePopState(e) {
  const state = e.state?.__z
  if(!state) return
  abortAllRequest()
  
  try {
    const html = await $fetch(location.href, { method: "GET" })
    if(html) {
      swapPage(html)
      const scroll = state.scroll
      if(!scroll) return
      requestAnimationFrame(() => window.scrollTo({ left: scroll.x, top: scroll.y }))
    }
  } catch (err) {
    console.error("Popstate failed", err)
    window.location.reload()
  }
}
