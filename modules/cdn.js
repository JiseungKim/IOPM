const appsettings = require('./config')

module.exports = path => `${appsettings.cdn.protocol}://${appsettings.cdn.host}:${appsettings.cdn.port}/${path}`