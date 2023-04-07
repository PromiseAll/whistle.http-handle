## 默认规则
```js
* http-handle://
````
默认规则路径js文件为项目下的 whistle.handle.rules.js

## 配置whistle规则rules

匹配的域名 http-handle://规则路径
```js
wwww.baidu.com http-handle://E:\code\my\whistle.http-handle\index.js
````

## 规则

 - reqConfig 真正请求时的数据配置
   - url 请求的url
   - method 请求的方法
   - headers 头信息
   - query 查询字符串对象
   - bodyType body的类型 formData|form|json|text
   - body 数据  string|object

 - reqConfig 返回客户端时的数据配置
   - statusCode 状态码
   - headers 头信息
   - body 数据  string|object|buffer  返回数据为json时自动格式化为对象

````js
module.exports = [
  {
    // 匹配的 url 可使用 ** ，* ，？匹配符
    url: "**/api.juejin.cn/recommend_api/v1/article/recommend_cate_feed",
    // 匹配的 method
    method: "get",
    // 发送请求前 调用next()修改数据
    beforeSendRequest(reqConfig, next) {
      next(reqConfig)
    },
    // 返回响应前 调用next()修改数据
    beforeSendResponse(reqConfig, resConfig, next) {
      next(resConfig)
    }
  }
]
````
