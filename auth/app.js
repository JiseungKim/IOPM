const express = require("express");
const async_handler = require("express-async-handler");
const appsettings = require("./modules/config");
const auth_middleware = require("./middlewares/authenticate")
const cookie_parser = require('cookie-parser')
const authenticator = require('./models/authenticator')
const accounts = require('./models/accounts')
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express();
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.json());
app.use(cookie_parser())

app.locals.cdn = require("./modules/cdn");


app.get(
    "/",
    async_handler(async (req, res, next) => {
        try {
            const { access, refresh } = await authenticator.assert(req.cookies.access_token, req.cookies.refresh_token)
            res.cookie('access_token', access, { httpOnly: true })
            res.cookie('refresh_token', refresh, { httpOnly: true })
            res.redirect('project')
        } catch (e) {
            res.render("home");
        }
    })
);

app.use("/auth", require("./routers/auth"));

app.use(auth_middleware)

app.use(createProxyMiddleware({
    target: "http://localhost:80",
    changeOrigin: true,
    router: async (req) => `http://${await accounts.endpoint(req.headers.uuid)}`,
    router: (req) => 'http://localhost:4000',
    onProxyReq: (proxy_req, req, res) => {

        function write_body(proxy_req, data) {
            proxy_req.setHeader('Content-Length', Buffer.byteLength(data))
            proxy_req.write(data)
        }

        proxy_req.setHeader('uuid', req.headers.uuid)

        if (!req.body || !Object.keys(req.body).length)
            return

        if (proxy_req.getHeader('Content-Type') === 'application/json')
            write_body(JSON.stringify(req.body))
    },
    onProxyRes: (proxy_res, req, res) => {
        proxy_res.headers.uuid = req.headers.uuid
    },
    onError: (err, req, res) => {
        console.error(err)
        res.status(500).send(err)
    }
}))

app.listen(appsettings.common.port, () => {
    console.log(`listen to ${appsettings.common.port}..`)
});
