const appsettings = require('./config')

module.exports = {
    cdn: function (path) {
        return `${appsettings.cdn.protocol}://${appsettings.cdn.host}:${appsettings.cdn.port}/${path}`
    }
}