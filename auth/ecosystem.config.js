module.exports = {
    apps: [{
        name: "auth",
        script: "./app.js",
        env: {
            NODE_ENV: "local",
        },
        env_development: {
            NODE_ENV: "development",
        }
    }]
}
