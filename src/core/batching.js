import { dispatchZEvent } from "./utils.js"

let queue = []
let schedule = false

export function enqueueSwapOps(ops) {
  queue.push(...ops)
  if(schedule) return
  schedule = true
  
  queueMicrotask(() => {
    schedule = false
    const ops = queue
    queue = []
    for(let { el, node, mode } of ops) {
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
    }
  })
}