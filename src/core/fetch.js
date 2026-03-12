import { dispatchZEvent } from "./utils.js"

//controllers map is request controller
const controllers = new Map()

export async function $fetch(url, params = {}) {
  const {
    method, body, headers = {},
    fetchOpt = {}, meta = {}
  } = params
  
  const key = `${url}:${method}`
  if(controllers.has(key)) controllers.get(key).abort()
  const controller = new AbortController()
  controllers.set(key, controller)
  const hasBody = method !== "GET" && body !== undefined
  const manualRawReqTimeout = meta.el?.dataset?.timeout || "10s"
  const match = manualRawReqTimeout.match(/^(\d+(\.\d+)?)s$/)
  if(!match) {
    console.error(`[Briz.js] Invalid timeout format: "${manualRawReqTimeout}". Format must be a number followed by 's'. Request aborted.`)
    return
  }
  const manualReqTimeout = parseFloat(match[1]) * 1000
  
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
    }, manualReqTimeout)
    const res = await fetch(request.url, request.options)
    if(!res.ok) throw new Error(await res.text())
    if(res.redirected) {
      window.location.href = res.url
      return
    }
    
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
