angular.module 'Seed'

.run [
  '$window'
  '$rootScope'
  (
    $window
    $rootScope
  ) ->
    console.log """
    Telco Data Localization Vis init...
    """

    # location change lisenter
    $rootScope.$on '$stateChangeStart'
    , (event, toState, toParams, fromState, fromParams) ->
      $rootScope.fromState = fromState
      $rootScope.fromParams = fromParams
      $rootScope.toState = toState
      $rootScope.toParams = toParams

    # bluebird setting
    Promise = $window.Promise
    Promise.setScheduler (cb) ->
      $rootScope.$evalAsync cb
]