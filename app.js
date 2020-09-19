const express = require("express");
const async_handler = require("express-async-handler");
const appsettings = require("./modules/config");
const auth_middleware = require("./middlewares/authenticate")
const cookie_parser = require('cookie-parser')
const authenticator = require('./models/authenticator')

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
            const { access, refresh, uuid } = await authenticator.assert(req.cookies.access_token, req.cookies.refresh_token)
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

app.use("/project", require('./routers/project'))
app.use("/api/user", require("./routers/api.user"));
app.use("/api/section", require("./routers/api.section"));
app.use("/api/participation", require("./routers/api.participation"));
app.use("/api/project", require("./routers/api.project"));
app.use("/api/todo", require("./routers/api.todo"));


app.listen(appsettings.common.port, () => {
    console.log(`listen to ${appsettings.common.port}..`);
});
