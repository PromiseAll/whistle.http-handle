const got = require("got")
module.exports = async function (ctx, reqConfig) {
  const gotReqConfig = formatGotConfig(reqConfig)
  const gotRes = await got(gotReqConfig)
  const resConfig = getResConfigByGotRes(gotRes)
  const config = await (new Promise((resolve, reject) => {
    ctx.rule.beforeSendResponse(reqConfig, resConfig, resolve)
  }))
  ctx.status = config.statusCode
  ctx.set(config.headers)
  ctx.body = config.body
}

const formatGotConfig = (reqConfig) => {
  const { url, method, headers, bodyType, query, body } = reqConfig
  const config = {
    url,
    method,
    headers,
    searchParams: query,
    decompress: false,
    allowGetBody: true, // get可以附带body
  }
  switch (bodyType) {
    case "formData":
      if (body) {
        const formData = new FormData();
        for (const key in body) {
          formData.append(key, body[key]);
        }
        config.body = formData
      }
      break;
    case "form":
      config.form = body
      break;
    case "json":
      config.json = body
      break;
    case "text":
      config.body = body
      break;
    default:
      config.body = body
      break;
  }
  return config
}

const getResConfigByGotRes = (gotRes) => {
  const { statusCode, headers, body, rawBody } = gotRes
  const config = {
    statusCode,
    headers,
    body
  }
  if (headers["content-type"].includes("application/json")) {
    config.body = JSON.parse(body)
  }
  if (headers["content-type"].includes("stream")) {
    config.body = rawBody
  }
  return config
}
