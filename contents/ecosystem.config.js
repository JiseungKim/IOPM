module.exports = {
    apps: [{
        name: "contents",
        script: "./app.js",
        env: {
            ENVIRONMENT: "local",
        },
        env_development: {
            ENVIRONMENT: "development",
        }
    }]
}