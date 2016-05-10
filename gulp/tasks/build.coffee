echo = console.log
{error} = console
gulp = require 'gulp'
gulpFilter = require 'gulp-filter'

plumber = require 'gulp-plumber'

coffee = require 'gulp-coffee'
jade = require 'gulp-jade'
less = require 'gulp-less'
#LessPluginCleanCSS = require 'less-plugin-clean-css'
#LessPluginAutoPrefix = require 'less-plugin-autoprefix'

tap = require 'gulp-tap'
watch = require 'gulp-watch'
browserSync = require 'browser-sync'

module.exports = ->

  jadeFilter = gulpFilter ['**/*.jade']
  lessFilter = gulpFilter ['**/*.less']
  coffeeFilter = gulpFilter ['**/*.coffee']

  gulp.src [
    'src/**/*'
  ]

  .pipe plumber
    errorHandler: (err) ->
      error err
      @emit 'end'

  # jade
  .pipe jadeFilter
  .pipe jade
    pretty: true
    locals: {}
  .pipe jadeFilter.restore()

  # stylus
  .pipe lessFilter
  .pipe less()
  .pipe lessFilter.restore()

  # coffee
  .pipe coffeeFilter
  .pipe coffee
    bare: true
  .pipe coffeeFilter.restore()

  # browserSync
  .pipe browserSync.reload stream:true

  .pipe plumber.stop()

  # dest
  .pipe gulp.dest 'build'
