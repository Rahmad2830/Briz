import { dispatchZEvent } from "./dispatcher.js"

export function swap(html) {
  const element = document.querySelectorAll("[data-swap]")
  if(!element.length) return
  const fragment = document.createRange().createContextualFragment(html)
  
  element.forEach(el => {
    const value = el.getAttribute("data-swap")
    const [key, mode] = value.split(":").map(p => p.trim())
    const node = fragment.querySelector(`[data-swap="${value}"]`)
    if(!node) return
    
    dispatchZEvent("z:before-swap", { el, mode }, el)
    
    let targetEl = el
    if(mode) {
      const children = node.childNodes.length ? Array.from(node.childNodes).map(c => c.cloneNode(true)) : []
      if(children.length) {
        switch (mode) {
          case "append":
            el.append(...children)
            break
          case "prepend":
            el.prepend(...children)
            break
          case "after":
            el.after(...children)
            break
          case "before":
            el.before(...children)
            break
          default:
            throw new Error(`mode ${mode} is not exist`)
        }
      }
    } else {
      const newEl = node.cloneNode(true)
      el.replaceWith(newEl)
      targetEl = newEl
    }
    
    dispatchZEvent("z:after-swap", { el: targetEl, mode }, targetEl)
  })
}

export function swapPage(html) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  
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
  
  //replace body
  const body = doc.body
  const title = doc.title
  
  dispatchZEvent("z:before-navigation", {}, document)
  
  document.body.replaceWith(body)
  document.title = title || document.title
  
  dispatchZEvent("z:after-navigation", {}, document)
}