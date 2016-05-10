runSequence = require 'run-sequence'

module.exports = ->

  runSequence 'clean'
  , 'libs', 'build'
  , 'watch', 'browsersync'