export function dispatchZEvent(name, detail, target = document) {
  target.dispatchEvent(new CustomEvent(name, {
    detail,
    bubbles: true
  }))
}
