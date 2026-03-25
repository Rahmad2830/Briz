import { $fetch, abortAllRequest } from "./fetch.js"
import { setZState, withTransition, showLoading, hideLoading } from "./utils.js"
import { performSwap } from "./swap.js"
import { observer } from "../streams/mutation_observer.js"
import { visibilityHandler } from "../streams/polling/polling.js"

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
  const hasTransition = element.hasAttribute("data-transition")
  const submitBtn = element.querySelector("button[type='submit']")
  if(submitBtn) submitBtn.disabled = true
  
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
    if(html) {
      requestAnimationFrame(() => withTransition(hasTransition, () => performSwap(html)))
    }
  } catch (err) {
    console.error("Request failed", err)
  } finally {
    if(submitBtn) submitBtn.disabled = false
  }
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
  showLoading()
  abortAllRequest()
  setZState({ scroll: { x: window.scrollX, y: window.scrollY } })
  const url = element.href
  if(!url) return
  
  try {
    const html = await $fetch(url, {
      method: "GET",
      meta: { el: element, url }
    })
    if(html) {
      history.pushState({ __z: {} }, "", url)
      requestAnimationFrame(() => {
        performSwap(html)
        window.scrollTo({ top: 0 })
        hideLoading()
      })
    }
  } catch (err) {
    console.error("Request failed", err)
    window.location.href = url
  } finally {
    hideLoading()
  }
}

async function handlePopState(e) {
  const state = e.state?.__z
  if(!state) return
  abortAllRequest()
  
  try {
    const html = await $fetch(location.href, { method: "GET" })
    if(html) {
      requestAnimationFrame(() => {
        performSwap(html)
        const scroll = state.scroll
        if(!scroll) return
        window.scrollTo({ left: scroll.x, top: scroll.y })
      })
    }
  } catch (err) {
    console.error("Popstate failed", err)
    window.location.reload()
  }
}
