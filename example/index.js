import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use('/src', express.static(path.join(__dirname, '../src')))


app.get('/', (req, res) => {
  res.render('index')
})

app.get('/swap', (req, res) => {
  res.render('swap')
})
app.get('/partials/swap', (req, res) => {
  res.render('partials/swap')
})

let count = 0

app.get('/polling', (req, res) => {
  res.render('polling', { count })
})
app.get('/partials/polling', (req, res) => {
  count++
  res.render('partials/polling', { count })
})

app.listen(3000, () => {
  console.log('Demo Briz.js running on http://localhost:3000')
})
