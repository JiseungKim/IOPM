const accounts = require('../models/accounts')
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = createProxyMiddleware({
    target: "http://localhost:80",
    changeOrigin: true,
    router: async (req) => `http://${await accounts.endpoint(req.headers.id)}`,
    onProxyReq: (proxy_req, req, res) => {

        function write_body(proxy_req, data) {
            if (data == null)
                return
            proxy_req.setHeader('Content-Length', Buffer.byteLength(data))
            proxy_req.write(data)
        }

        proxy_req.setHeader('id', req.headers.id)

        if (proxy_req.getHeader('Content-Type') === 'application/json')
            write_body(proxy_req, JSON.stringify(req.body))
    },
    onProxyRes: (proxy_res, req, res) => {
        proxy_res.headers.id = req.headers.id
    },
    onError: (err, req, res) => {
        console.error(err)
        res.status(500).send(err)
    }
})