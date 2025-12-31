function zInit() {
  const defaultEvents = {
    "BUTTON": "click",
    "A": "click",
    "FORM": "submit",
    "INPUT": "input",
    "SELECT": "change",
    "TEXTAREA": "input"
  }
  
  //event delegation
  document.addEventListener("click", handleEvent)
  document.addEventListener("submit", handleEvent)
  document.addEventListener("input", handleEvent)
  document.addEventListener("change", handleEvent)
  
  async function handleEvent(e) {
    const el = e.target.closest("[z-get], [z-post]")
    if(!el) return
    const event = e.type
    const trigger = el.getAttribute("z-trigger") || defaultEvents[el.tagName] || "click"
    if(trigger !== event) return
    
    if(event === "submit") e.preventDefault()
    
    const url = el.getAttribute("z-get") || el.getAttribute("z-post")
    const target = el.getAttribute("z-target")
    const data = el.getAttribute("z-data")
    const headers = el.getAttribute("z-headers") ? JSON.parse(el.getAttribute("z-headers")) : {}
    const options = el.getAttribute("z-options") ? JSON.parse(el.getAttribute("z-options")) : {}
    const loading = el.getAttribute("z-loading")
    
    //data handling
    let bodyData
    if(data) {
      const form = document.querySelector(data)
      if(form) bodyData = new URLSearchParams(new FormData(form))
      if (bodyData) {
        headers["Content-Type"] = "application/x-www-form-urlencoded"
      }
    }
    
    //fetching
    let method
    if(el.hasAttribute("z-get")) method = "GET"
    if(el.hasAttribute("z-post")) method = "POST"
    
    const createLoading = document.querySelector(loading)
    
    if(!method) return
    await $fetch(url, {
      loading: createLoading,
      headers,
      method,
      body: bodyData,
      target,
      ...options
    })
    
  }
}

async function $fetch(url, params = {}) {
  const { loading, method, headers = {}, body, target, ...options } = params
  
  const opt = {
    method,
    headers: {
      "Accept": "text/html",
      ...$fetch.defaults.headers,
      ...headers
    },
    body: (method !== "GET") ? body : null,
    ...$fetch.defaults.options,
    ...options
  }
  
  try {
    if(loading) loading.style.display = ""
    const res = await fetch(url, opt)
    const html = await res.text()
    if(target) {
      const tg = document.querySelector(target)
      if(tg) tg.innerHTML = html
    }
  } catch(err) {
    console.error(`Request failed ${err}`)
  } finally {
    if(loading) loading.style.display = "none"
  }
}

//injecting global options and headers
$fetch.defaults = {
  headers: {},
  options: {}
}

$fetch.inject = ({ headers, options }) => {
  Object.assign($fetch.defaults.headers, headers)
  Object.assign($fetch.defaults.options, options)
}


document.addEventListener("DOMContentLoaded", () => {
  zInit()
})