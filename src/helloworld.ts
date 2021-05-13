const Koa = require("koa");
const app = (module.exports = new Koa());

app.use(async function (ctx: { body: string }) {
  ctx.body = "Hello World";
});

if (!module.parent) app.listen(40000);
