const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const client = require('prom-client')
const collectDefaultMetrics = client.collectDefaultMetrics
const Registry = client.Registry
const register = new Registry()
const prefix = 'worldcatui_'
collectDefaultMetrics({ register, prefix })

const p = 3002

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true)
        const { pathname, query } = parsedUrl

        if (pathname === '/metrics') {
            register.metrics().then(metrics => {
                res.setHeader('Content-Type', register.contentType)
                res.end(metrics)
                app.render(req, res, '/metrics', query)
            })
        } else {
            handle(req, res, parsedUrl).then(result => {
                if (result) {
                    console.log(result)
                }
            })
        }
    }).listen(p, err => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${p}`)
    })
})
