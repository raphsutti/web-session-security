// Cookie exfil via javascript remdiation by httpOnly set
const express = require('express')
const cookieParser = require('cookie-parser')
const { createReadStream } = require('fs')
const bodyParser = require('body-parser')
const { randomBytes } = require('crypto')

const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))

const USERS = {
  alice: 'password',
  bob: 'hunter2'
}
const BALANCES = {
  alice: 500,
  bob: 100
}

const SESSIONS = {}

app.get('/', (req, res) => {
	const sessionId = req.cookies.sessionId
  const username = SESSIONS[sessionId]
  if (username) {
    const balance = BALANCES[username]
    res.send(`Hi ${username}. Your balance is $${balance}`)
  } else {
    createReadStream('index.html').pipe(res)
  }
})

app.post('/login', (req, res) => {
  const username = req.body.username
  const password = USERS[username]
  if (req.body.password === password) {
    const sessionId = randomBytes(16).toString('base64')
		res.cookie('sessionId', sessionId, {
      httpOnly: true, // httpOnly - no cookie via javascript
    });
		SESSIONS[sessionId] = username
    res.redirect('/')
  } else {
    res.send('failed login')
  }
})

app.get('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId
  delete SESSIONS[sessionId]
  res.clearCookie('sessionId')
  res.redirect('/')
})

app.listen(4000)
