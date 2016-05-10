angular.module 'TDLV'

.provider 'authorization', ->
  resolve: [
    '$rootScope'
    '$state'
    '$timeout'
    'AUTH'
    'Global'
    (
      $rootScope
      $state
      $timeout
      AUTH
      Global
    ) ->
  ]

  $get: ->