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
    const action = el.getAttribute("z-action") || defaultEvents[el.tagName] || "click"
    if(action !== event) return
    
    if(event === "submit") {
      if(el.tagName !== "FORM") {
        console.warn("Submit event is only belong to form element")
        return
      }
      e.preventDefault()
    }
    
    const url = el.getAttribute("z-get") || el.getAttribute("z-post")
    const target = el.getAttribute("z-target")
    const headers = el.getAttribute("z-headers") ? JSON.parse(el.getAttribute("z-headers")) : {}
    const options = el.getAttribute("z-options") ? JSON.parse(el.getAttribute("z-options")) : {}
    const loading = el.getAttribute("z-loading")
    const confirmAttr = el.getAttribute("z-confirm")
    
    //data handling
    let bodyData
    const form = el.closest("form")
    if(form) bodyData = new URLSearchParams(new FormData(form))
    if (bodyData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/x-www-form-urlencoded"
    }
    if (bodyData && headers["Content-Type"] === "application/json") {
      console.warn("Content-Type is JSON but body is URLSearchParams")
    }
    
    //fetching
    let method
    if(el.hasAttribute("z-get")) method = "GET"
    if(el.hasAttribute("z-post")) method = "POST"
    
    //action before request
    const createLoading = document.querySelector(loading)
    if(confirmAttr) {
      if(!confirm(confirmAttr)) return
    }
    
    //request
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

//fetch wrapper
$fetch.controllers = new Map()
async function $fetch(url, params = {}) {
  const { loading, method, headers = {}, body, target, ...options } = params
  
  //controller
  const key = `${method}:${url}:${target}`
  if($fetch.controllers.has(key)) $fetch.controllers.get(key).abort()

  const controller = new AbortController()
  $fetch.controllers.set(key, controller)
  
  const opt = {
    signal: controller.signal,
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
    if(!res.ok) {
      console.log(`Request failed ${res.status}`)
      return
    }
    const html = await res.text()
    
    if(target) {
      const targetId = target.split(",").map(t => t.trim())
      swapDom(html, targetId)
    }
  } catch(err) {
    if(err.name === "AbortError") return
    console.error(`Request failed ${err}`)
  } finally {
    if($fetch.controllers.get(key) === controller) $fetch.controllers.delete(key)
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

//target logic
function swapDom(html, parts = []) {
  const parser = new DOMParser()
  const parsed = parser.parseFromString(html, "text/html")
  
  for(const part of parts) {
    const [selector, addMethod] = part.split(":").map(s => s.trim())
    const id = document.querySelector(selector)
    const rep = parsed.querySelector(selector)
    if(!rep || !id) continue
    if(addMethod !== undefined) {
      if (rep.id === id.id) {
        console.warn(`Invalid swap: wrapper used with ${addMethod}`)
      }
      id.insertAdjacentHTML(addMethod, rep.innerHTML)
    } else {
      id.replaceWith(rep)
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  zInit()
})