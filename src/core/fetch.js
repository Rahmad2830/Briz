import { dispatchZEvent } from "./utils.js"

//controllers map is request controller
const controllers = new Map()

export async function $fetch(url, params = {}) {
  const {
    method, body, headers = {},
    fetchOpt = {}, meta = {}
  } = params
  
  const key = `${url}:${method}`
  if(controllers.has(key)) {
    controllers.get(key).abort()
    controllers.delete(key)
  }
  const controller = new AbortController()
  controllers.set(key, controller)
  const hasBody = method !== "GET" && body !== undefined
  
  const request = {
    url,
    options: {
      method,
      headers: {
        "Accept": "text/html",
        ...meta.headers,
        ...headers
      },
      signal: controller.signal,
      ...meta.fetchOpt,
      ...fetchOpt
    },
    meta
  }
  
  let requestTimeout = null
  let cleanup = () => {
    if(requestTimeout) {
      clearTimeout(requestTimeout)
      requestTimeout = null
    }
    if(controllers.get(key) === controller) controllers.delete(key)
  }
  
  if(hasBody) request.options.body = body
  dispatchZEvent("z:before-request", { request }, meta.el)
  
  try {
    requestTimeout = setTimeout(() => {
      controller.abort()
    }, 10000)
    const res = await fetch(request.url, request.options)
    if(!res.ok) throw new Error(await res.text())
    
    dispatchZEvent("z:request-success", { request, response: res }, meta.el)
    
    return await res.text()
  } catch (err) {
    dispatchZEvent("z:request-error", { request, error: err }, meta.el)
    if(err.name === "AbortError") return
    throw new Error(`Request Failed ${err.message}`)
  } finally {
    cleanup()
    dispatchZEvent("z:after-request", { request }, meta.el)
  }
}

export function abortAllRequest() {
  controllers.forEach(controller => controller.abort())
  controllers.clear()
}