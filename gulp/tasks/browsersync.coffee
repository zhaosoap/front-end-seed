echo = console.log
browserSync = require 'browser-sync'
#url = require 'url'
#proxy = require 'proxy-middleware'
modRewrite  = require 'connect-modrewrite'

module.exports = ->

#  proxyOptions = url.parse 'http://localhost:9000/#/'
#  proxyOptions.route = '/'

  browserSync
    server:
      baseDir: './build'
      index: 'index.html'
#      middleware: [
#        proxy proxyOptions
#      ]
      middleware: [
#        (req, res, next) ->
#          echo req.originalUrl
#          next()
#          '!\.html|\.js|\.css|\.png$ / [L]'
        modRewrite [
          '!\\.\\w+$ /index.html [L]'
        ]
      ]
    port: 9000
    startPath: '/'
    watchTask: true
