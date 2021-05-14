// cookie is sequential number
const express = require('express')
const cookieParser = require('cookie-parser')
const { createReadStream } = require('fs')
const bodyParser = require('body-parser')

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

let nextSessionId = 0;
app.post('/login', (req, res) => {
  const username = req.body.username
  const password = USERS[username]
  if (req.body.password === password) {
    nextSessionId += 1; // Sequential
		res.cookie('sessionId', nextSessionId)
		SESSIONS[nextSessionId] = username
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
