const path = require('path')
const fs = require('fs')
const express = require('express')
const Database = require('better-sqlite3')

const PORT = process.env.PORT || 3000
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const PUBLIC_DIR = path.join(__dirname, 'public')

// Ensure the data directory exists (mounted volume in production)
fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'counter.db'))
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS counter (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    value INTEGER NOT NULL DEFAULT 0
  );
`)
db.prepare('INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)').run()

const selectCount = db.prepare('SELECT value FROM counter WHERE id = 1')
const incrementCount = db.prepare('UPDATE counter SET value = value + 1 WHERE id = 1')

const app = express()

app.get('/api/count', (req, res) => {
  res.json({ count: selectCount.get().value })
})

app.post('/api/count', (req, res) => {
  incrementCount.run()
  res.json({ count: selectCount.get().value })
})

app.use(express.static(PUBLIC_DIR))

app.listen(PORT, () => {
  console.log(`Eneagrama listening on port ${PORT}`)
})
