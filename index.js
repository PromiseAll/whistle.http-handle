const Koa = require('koa');
const path = require("path")
const bodyParser = require('http-body-parser').koa;
const middleware = require("./middleware/middleware")
const micromatch = require('micromatch');
const fsa = require("fs-extra")
const decache = require("decache")
const app = new Koa();
// 错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit("error", err, ctx)
  }
})
app.use(bodyParser({ enableTypes: ['json', 'form', 'text', 'multipart', 'stream'] }));
app.use(middleware)

const findRules = (rules, method, url) => {
  return rules.find(rule => {
    console.log(url, rule.url);
    console.log(micromatch.isMatch(url, rule.url));
    return rule.method.toLocaleLowerCase() == method.toLocaleLowerCase() && micromatch.isMatch(url, rule.url)
  })
}

exports.server = (server) => {
  const serverCallback = app.callback()
  server.on("request", (req, res) => {
    try {
      const { method, url, ruleValue } = req.originalReq
      const rulesPath = ruleValue || path.resolve("whistle.handle.rules.js")
      if (fsa.pathExistsSync(rulesPath)) {
        decache(rulesPath);
        const rules = require(rulesPath)
        if (!Array.isArray(rules)) { throw Error(`${rulesPath} rules is not array`) }
        const rule = findRules(rules, method, url)
        if (rule) {
          app.context.rule = rule
          serverCallback(req, res)
        } else {
          req.passThrough(); // 直接透传
        }
      } else {
        if (!Array.isArray(rules)) { throw Error(`${rulesPath} path does not exist`) }
      }
    } catch (error) {
      res.end(error.toString())
    }
  })

  // handle websocket request
  server.on('upgrade', (req/*, socket*/) => {
    // 修改 websocket 请求用，
    req.passThrough(); // 直接透传
  });

  // handle tunnel request
  server.on('connect', (req/*, socket*/) => {
    // 修改普通 tcp 请求用
    req.passThrough(); // 直接透传
  });

};
