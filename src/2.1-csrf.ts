// CSRF on strong cookie

// Run with malicious site in /attacker
// Open 127.0.0.1:9000/malicious.html

import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cookie from "koa-cookie";
import { randomBytes } from "crypto";

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(cookie());

const USERS: Record<string, string> = {
  alice: "couch", // Plaintext passwords 🙈
  bob: "potato",
};

const FUNDS: Record<string, number> = {
  alice: 700,
  bob: 20,
};

const SESSIONS: Record<string, string> = {};

router.get("/", (ctx) => {
  const sessionId = ctx.cookie?.sessionId;
  const username = SESSIONS[sessionId];

  if (!sessionId || !username) {
    return (ctx.body = `
      <h1>Login to your account</h1>
      <form method='POST' action="/login">
        Username:
        <input name="username" />
        Password:
        <input name="password" type="password" />
        <input type="submit" value="login" />
      </form>
    `);
  }

  const funds = FUNDS[username];
  ctx.body = `
    <h2>Welcome ${username}! You have $${funds} in your account</h2>
    <form method='POST' action='/transfer'>
      Send amount:
      <input name='amount' />
      To user:
      <input name='to' />
      <input type='submit' value='Send' />
    </form>
    <a href="/logout">Log out</a>
  `;
});

router.post("/login", (ctx) => {
  const body: Record<string, string> = ctx.request?.body;
  if (!body) {
    ctx.redirect("/");
  }
  const { username: reqUsername, password: reqPassword } = body;

  if (USERS[reqUsername] === reqPassword) {
    let nextSessionId = randomBytes(16).toString("hex"); // Random;
    ctx.cookies.set("sessionId", nextSessionId, {
      httpOnly: false,
      secure: false,
      sameSite: "none",
      path: "/",
    });
    SESSIONS[nextSessionId] = reqUsername;
    ctx.redirect("/");
  } else {
    ctx.body = "Wrong username or password";
  }
});

router.get("/logout", (ctx) => {
  ctx.cookies.set("sessionId");
  ctx.redirect("/");
});

router.post("/transfer", (ctx) => {
  const sessionId = ctx.cookie?.sessionId;
  const username = SESSIONS[sessionId];

  if (!sessionId || !username) {
    ctx.body = "Invalid cookie";
  }
  const body: Record<string, string> = ctx.request?.body;
  if (!body) {
    ctx.redirect("/");
  }
  const { amount, to } = body;

  const amountNumber = Number(amount);

  FUNDS[username] -= amountNumber;
  FUNDS[to] += amountNumber;
  ctx.redirect("/");
});

app.use(router.routes());

app.listen(2021);
console.log("App running on port 2021");
