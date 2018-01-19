const path = require('path')
const express = require('express')
const app = express()

const __distPath = path.join(path.dirname(__dirname), 'dist') //静态文件路径
app.use(express.static(__distPath))

const {
  createBundleRenderer
} = require('vue-server-renderer')
const serverBundle = require(path.join(__distPath, 'vue-ssr-server-bundle.json'))
const clientManifest = require(path.join(__distPath, 'vue-ssr-client-manifest.json'))
const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  clientManifest
})

app.get('*', (req, res) => {
  const context = {
    url: req.url
  }
  // 这里无需传入一个应用程序，因为在执行 bundle 时已经自动创建过。
  // 现在我们的服务器与应用程序已经解耦！
  renderer.renderToString(context, (err, html) => {
    if (err) {
      if (err.code === 404) {
        res.status(404).end('Page not found')
      } else {
        res.status(500).end('Internal Server Error')
      }
    } else {
      let resHtml = `<html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width,initial-scale=1.0">
                                <title>vue-ssr-demo</title>
                                ${context.renderResourceHints()}
                                ${context.renderStyles()}
                            </head>
                            <body>
                                ${html}
                                ${context.renderState()}
                                ${context.renderScripts()}
                            </body>
                            </html>`
      res.end(resHtml)
    }
  })
  //res.sendFile(path.join(__distPath, 'client.html')) //客户端加载(配置中需将index.html改为其它名字，否则默认访问index.html)
});


const httpServer = require('http').createServer(app)
// 监听8000端口
httpServer.listen(8000);
console.log('success listen port 8000')
