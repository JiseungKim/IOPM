module.exports = {
    apps: [{
        name: "auth",
        script: "./app.js",
        env: {
            ENVIRONMENT: "local",
        },
        env_development: {
            ENVIRONMENT: "development",
        }
    }]
}
