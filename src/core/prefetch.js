import { $fetch } from "./fetch.js"
export const PAGES_CACHE = new Map()

export function prefetch(url) {
  if(PAGES_CACHE.has(url)) {
    return PAGES_CACHE.get(url).promise
  }

  const promise = $fetch(url, { method: "GET" })
    .then(res => {
      if(res === undefined) {
        PAGES_CACHE.delete(url)
        return
      }

      setTimeout(() => {
        if(PAGES_CACHE.get(url)?.settled) PAGES_CACHE.delete(url)
      }, 15000)
      return res
    })
    .catch(err => {
      PAGES_CACHE.delete(url)
      throw err
    })
    .finally(() => {
      const entry = PAGES_CACHE.get(url)
      if(entry) entry.settled = true
    })
  PAGES_CACHE.set(url, { promise, settled: false })
  return promise
}
