import { $fetch } from "./fetch.js"
export const PAGES_CACHE = new Map()

export function prefetch(url) {
  if(PAGES_CACHE.has(url)) {
    return PAGES_CACHE.get(url).promise
  }

  const promise = $fetch(url, { method: "GET" })
  PAGES_CACHE.set(url, { promise })
  setTimeout(() => PAGES_CACHE.delete(url), 15000)
  return promise
}
