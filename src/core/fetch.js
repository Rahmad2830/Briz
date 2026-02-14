import { dispatchZEvent } from "./dispatcher.js"

function normalizeUrl(url) {
  try { return new URL(url, location.href).pathname }
  catch { return url }
}

/**
- defaults object is for injecting all the request headers and options.
- specialReq object is for adding something special to a request header and options like x-custom etc.
- controllers map is request controller
**/
let defaults = {
  headers: {},
  fetchOpt: {}
}
let specialReq = {}
const controllers = new Map()
let navigationController

export async function $fetch(url, params = {}) {
  const normalizedUrl = normalizeUrl(url)
  const special = specialReq[normalizedUrl] || {}
  const {
    method, body, headers = {},
    type = "text", fetchOpt = {}, meta = {}
  } = params
  
  const key = `${normalizedUrl}:${method}`
  if(controllers.has(key)) controllers.get(key).abort()
  const controller = new AbortController()
  controllers.set(key, controller)
  const requestTimeout = setTimeout(() => {
    controller.abort()
  }, 10000)
  const isJson = body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams)
  const hasBody = method !== "GET" && body !== undefined
  
  const options = {
    method,
    headers: {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      "Accept": type === "json" ? "application/json" : "text/html",
      ...defaults.headers,
      ...(special.headers || {}),
      ...headers
    },
    signal: controller.signal,
    ...defaults.fetchOpt,
    ...(special.fetchOpt || {}),
    ...fetchOpt
  }
  
  if(hasBody) options.body = isJson ? JSON.stringify(body) : body
  dispatchZEvent("z:before-request", { meta }, meta.el)
  
  try {
    const res = await fetch(url, options)
    if(!res.ok) throw new Error(await res.text())
    
    dispatchZEvent("z:request-success", { meta }, meta.el)
    
    if (type === "text") return await res.text()
    if (type === "json") return await res.json()
    
    throw new Error(`Response type "${type}" not supported`)
  } catch (err) {
    dispatchZEvent("z:request-error", { meta }, meta.el)
    if(err.name === "AbortError") return
    throw new Error(`Request Failed ${err.message}`)
  } finally {
    if(controllers.get(key) === controller) controllers.delete(key)
    clearTimeout(requestTimeout)
    dispatchZEvent("z:after-request", { meta }, meta.el)
  }
}

export function abortAllRequest() {
  controllers.forEach(controller => controller.abort())
  controllers.clear()
}

$fetch.inject = ({ headers = {}, fetchOpt = {} }) => {
  Object.assign(defaults.headers, headers)
  Object.assign(defaults.fetchOpt, fetchOpt)
}

$fetch.special = (url, params = {}) => {
  const normalizedUrl = normalizeUrl(url)
  if (!specialReq[normalizedUrl]) {
    specialReq[normalizedUrl] = { headers: {}, fetchOpt: {} }
  }

  Object.assign(specialReq[normalizedUrl].headers, params.headers || {})
  Object.assign(specialReq[normalizedUrl].fetchOpt, params.fetchOpt || {})
}

//for spa usage only
$fetch.clearSpecial = (url) => delete specialReq[normalizeUrl(url)]