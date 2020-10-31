const express = require("express");
const appsettings = require("./modules/config");
const cookie_parser = require('cookie-parser')

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookie_parser())

app.locals.cdn = require("./modules/cdn");

app.use("/project", require('./routers/project'))
app.use("/api/user", require("./routers/api.user"));
app.use("/api/section", require("./routers/api.section"));
app.use("/api/participation", require("./routers/api.participation"));
app.use("/api/project", require("./routers/api.project"));
app.use("/api/todo", require("./routers/api.todo"));

app.listen(appsettings.common.port, () => {
    console.log(`listen to ${appsettings.common.port}..`);
});
