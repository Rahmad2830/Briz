import { enqueueSwapOps } from "./batching.js"

export function performSwap(html) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  
  const body = document.body
  const bodyResp = doc.body
  const hasSwap = body.querySelectorAll("[data-swap]")
  const titleResp = doc.title
  
  //morph
  if(hasSwap.length > 0) {
    const ops = []
    hasSwap.forEach(element => {
      const value = element.dataset.swap
      const node = bodyResp.querySelector(`[data-swap="${value}"]`)
      if(node) {
        const [_, mode] = value.split(":").map(p => p.trim())
        ops.push({ el: element, node, mode })
      }
    })
    
    if(ops.length > 0) {
      enqueueSwapOps(ops)
      return
    }
  }
  
  //diff meta
  function getMetaKey(meta) {
    return (
      meta.getAttribute("name") ||
      meta.getAttribute("property") ||
      meta.getAttribute("http-equiv") ||
      (meta.hasAttribute("charset") ? "charset" : null)
    )
  }
  
  const oldMetas = Array.from(document.head.querySelectorAll("meta"))
  const newMetas = Array.from(doc.head.querySelectorAll("meta"))
  const oldMap = new Map()
  
  oldMetas.forEach(meta => {
    const key = getMetaKey(meta)
    if(key) oldMap.set(key, meta)
  })
  
  newMetas.forEach(meta => {
    const key = getMetaKey(meta)
    if(!key) return
    
    const old = oldMap.get(key)
    if(old) {
      old.replaceWith(meta.cloneNode(true))
      oldMap.delete(key)
    } else {
      document.head.append(meta.cloneNode(true))
    }
  })
  oldMap.forEach(meta => meta.remove())
  
  //fallback
  const bodyFrag = Array.from(bodyResp.childNodes)
  document.title = titleResp || document.title
  body.replaceChildren(...bodyFrag)
}