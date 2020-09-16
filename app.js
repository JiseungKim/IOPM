// const cookie_parser = require("cookie-parser");
const express = require("express");
const async_handler = require("express-async-handler");
const appsettings = require("./modules/config");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.json());
// app.use(cookie_parser);

app.locals.cdn = require("./modules/cdn");

app.get(
  "/",
  async_handler(async (req, res, next) => {
    res.render("home");
  })
);

app.use("/auth", require("./routers/auth"))
app.use('/team', require('./routers/team'))
app.use("/api/user", require("./routers/api.user"))
app.use("/api/section", require("./routers/api.section"))
app.use("/api/participation", require("./routers/api.participation"))
app.use("/api/project", require("./routers/api.project"))
app.use("/api/todo", require("./routers/api.todo"))

app.get(
  "/",
  async_handler(async (req, res, next) => {
    res.render("home", { data: { title: "cshyeon" } })
  })
)

app.listen(appsettings.common.port, () => {
  console.log(`listen to ${appsettings.common.port}..`);
});
