const path = require('path')
const fs = require('fs')
const express = require('express')

const PORT = process.env.PORT || 3000
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const PUBLIC_DIR = path.join(__dirname, 'public')
const COUNTER_FILE = path.join(DATA_DIR, 'counter.json')

// Ensure the data directory exists (mounted volume in production)
fs.mkdirSync(DATA_DIR, { recursive: true })

function readCount() {
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf8')
    const value = JSON.parse(raw).count
    return Number.isFinite(value) ? value : 0
  } catch (err) {
    return 0
  }
}

function writeCount(value) {
  const tmp = `${COUNTER_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify({ count: value }))
  fs.renameSync(tmp, COUNTER_FILE)
}

// In-memory cache, persisted to disk on every increment
let count = readCount()

const app = express()

app.get('/api/count', (req, res) => {
  res.json({ count })
})

app.post('/api/count', (req, res) => {
  count += 1
  writeCount(count)
  res.json({ count })
})

app.use(express.static(PUBLIC_DIR))

app.listen(PORT, () => {
  console.log(`Eneagrama listening on port ${PORT}`)
})
