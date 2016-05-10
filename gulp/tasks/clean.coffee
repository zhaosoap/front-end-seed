echo = console.log
{error} = console
del = require 'del'
{exit} = process

module.exports = (callback) ->
  del [
    'build'
    'dist'
    '.tmp'
    'trash'
  ], (err, deletedFiles) ->
    if err
      error err
      exit 1
    else if deletedFiles.length > 0
      echo """
      Files deleted:
      #{deletedFiles.join '\n'}
      """
      callback()
    else callback()
