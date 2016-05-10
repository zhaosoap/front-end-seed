angular.module 'TDLV'

.provider 'gResolve', [
  'authorizationProvider'
  (
    authorizationProvider
  ) ->
    authorization: authorizationProvider.resolve
    $get: ->
]
