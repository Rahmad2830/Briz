document.addEventListener("z:before-request", (event) => {
  //if you wanna see all event detail use 'console.log(event)'
  
  const request = event.detail.request
  
  //if request method are POST
  if(request.options.method) {
    //grab csrf_token from meta tag then use it
    const csrf_token = document.querySelector("meta[name='csrf_token']")?.getAttribute("content")
    
    //inject headers
    request.options.headers = {
      ...(request.options.headers || {}),
      "x-csrf-token": csrf_token
    }
  }
  
  //Toggle loading before request action
  const element = request.meta.el
  if(!element) return

  if(element?.id === "form") {
    const loading = document.querySelector("#spinner")
    loading.classList.remove("d-none")
  }
})

document.addEventListener("z:after-request", (event) => {
  //toggle loading after request done
  
  //element after swap
  const element = event.detail.request.meta?.el
  if(!element) return
  
  if(element.id === "form") {
    const loading = document.querySelector("#spinner")
    loading.classList.add("d-none")
  }
})