import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from "crypto"
import multer from "multer"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const forms = multer()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/src', express.static(path.join(__dirname, '../src')))
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use((req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex')
  res.locals.csrf_token = token
  next()
})

//Home
app.get('/', (req, res) => {
  res.render('index')
})

//basic swap
app.get('/swap', (req, res) => {
  res.render('swap')
})
app.get('/partials/swap', (req, res) => {
  res.render('partials/swap')
})

let count = 0
//polling
app.get('/polling', (req, res) => {
  res.render('polling', { count })
})
app.get('/partials/polling', (req, res) => {
  count++
  res.render('partials/polling', { count })
})

//Inject header
app.get("/event", (req, res) => {
  res.render("event")
})
app.post("/partials/event", forms.none(), (req, res) => {
  const token = req.headers["x-csrf-token"]
  
  console.log(token)
  console.log(req.body)
  res.render("partials/event")
})

//sse
app.get("/sse", (req, res) => {
  res.render("sse")
})
app.get("/partials/sse", (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  let counter = 0

  const intervalId = setInterval(() => {
    counter++

    app.render('partials/sse', { counter }, (err, html) => {
      if (err) {
        console.error('Render error:', err)
        return
      }

      const cleanHtml = html.replace(/\r?\n|\r/g, "")
      //make sure this event match with event that you write in data-event attribute
      res.write(`event: counter-update\n`)
      res.write(`data: ${cleanHtml}\n\n`)
    })
  }, 1000)

  req.on('close', () => {
    clearInterval(intervalId)
    res.end()
  })
})

//loading example
app.get("/loading", (req, res) => {
  res.render("loading")
})
app.get("/partials/loading", async(req, res) => {
  await new Promise(resolve => setTimeout(resolve, 4000))
  
  res.render("partials/loading")
})

//multi-swap
app.get("/multi_swap", (req, res) => {
  res.render("multi_swap")
})
app.get("/partials/multi_swap", (req, res) => {
  res.render("partials/multi_swap")
})

//redirect
app.get("/redirect", (req, res) => {
  res.render("redirect")
})
app.post("/partials/redirect", (req, res) => {
  res.redirect("/")
})

//transition
app.get("/transition", (req, res) => {
  res.render("transition")
})
app.get("/partials/transition", (req, res) => {
  res.render("partials/transition")
})

app.listen(3000, () => {
  console.log('Demo Briz.js running on http://localhost:3000')
})
