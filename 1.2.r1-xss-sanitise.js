// cookie exfil remediation by sanitising user input
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const { randomBytes } = require('crypto')
const htmlEscape = require('html-escape')

const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use((req, res, next) => {
  res.set('X-XSS-Protection', '0') 
  next()
})

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
  const username = SESSIONS[req.cookies.sessionId]
  const source = htmlEscape(req.query.source) // Sanitise user input

  if (username) {
    res.send(`
      Hi ${username}. Your balance is $${BALANCES[username]}.
      <form method='POST' action='/transfer'>
        Send amount:
        <input name='amount' />
        To user:
        <input name='to' />
        <input type='submit' value='Send' />
      </form>
      <h1>
      ${source ? `Hi ${source} reader` : ''}
      </h1>
    `)
  } else {
    res.send(`
      <h1>
      ${source ? `Hi ${source} reader` : ''}
      Log in to your bank account:
      </h1>
      <form method='POST' action='/login'>
        Username: <input name='username' />
        Password: <input name='password' type='password' />
        <input type='submit' value='Login' />
        </form>
    `)
  }
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  const actualPassword = USERS[username]
  if (req.body.password === actualPassword) {
    const SessionId = randomBytes(16).toString('base64')
    SESSIONS [SessionId] = username 
    res.cookie('sessionId', SessionId, {
      // secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.redirect('/') 
  } else {
    res.send('failed login')
  }
})

app.get('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId
  delete SESSIONS[sessionId]
  res.clearCookie('sessionId', {
    // secure: true,
    httpOnly: true,
    sameSite: 'lax'
  })
  res.redirect('/')
})

app.post('/transfer', (req, res) => {
  const sessionId = req.cookies.sessionId
  const username = SESSIONS[sessionId]

  if (!username) {
    res.send('fail!')
    return
  }
  
  const amount =  Number(req.body.amount)
  const to = req.body.to

  BALANCES[username] -= amount
  BALANCES[to] += amount
  res.redirect('/')
})

app.listen(4000)

