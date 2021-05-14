// cookie is sequential number
import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cookie from "koa-cookie";

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
  ctx.body = `<h2>Welcome ${username}! You have $${funds} in your account</h2>
  <a href="/logout">Log out</a>`;
});

let currentSessionId = 1;

router.post("/login", (ctx) => {
  const body: Record<string, string> = ctx.request?.body;
  if (!body) {
    ctx.redirect("/");
  }
  const { username: reqUsername, password: reqPassword } = body;

  if (USERS[reqUsername] === reqPassword) {
    ctx.cookies.set("sessionId", currentSessionId.toString(), {
      httpOnly: false,
      secure: false,
      sameSite: "none",
      path: "/",
    });
    SESSIONS[currentSessionId] = reqUsername;
    currentSessionId++; // Sequential sessionId 🔥
    ctx.redirect("/");
  } else {
    ctx.body("Wrong username or password");
  }
});

router.get("/logout", (ctx) => {
  ctx.cookies.set("sessionId");
  ctx.redirect("/");
});

app.use(router.routes());

app.listen(2021);
console.log("App running on port 2021");
