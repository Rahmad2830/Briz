import { $fetch } from "./fetch.js"
import { swap, swapPage } from "./swap.js"

export function init() {
  document.addEventListener("click", handleNavigation)
  document.addEventListener("submit", handleForm)
  window.addEventListener("popstate", handlePopState)
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
    return
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
  
  const url = element.href
  if(!url) return
  const method = "GET"
  
  try {
    const html = await $fetch(url, {
      method, meta: { url, el: element }
    })
    if(html) {
      history.pushState(null, "", url)
      swapPage(html)
    }
  } catch (err) {
    console.error("Request failed", err)
  }
}

async function handlePopState() {
  try {
    const html = await $fetch(location.href, { method: "GET" })
    if(html) swapPage(html)
  } catch (err) {
    console.error("Popstate failed", err)
  }
}