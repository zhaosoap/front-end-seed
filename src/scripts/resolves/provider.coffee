angular.module 'Seed'

.provider 'gResolve', [
  'authorizationProvider'
  (
    authorizationProvider
  ) ->
    authorization: authorizationProvider.resolve
    $get: ->
]
