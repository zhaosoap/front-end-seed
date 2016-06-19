angular.module 'TDLV'

.config [
  '$locationProvider'
  '$urlRouterProvider'
  '$stateProvider'
  'gResolveProvider'
  (
    $locationProvider
    $urlRouterProvider
    $stateProvider
    gResolveProvider
  ) ->
    $locationProvider.html5Mode true

    $urlRouterProvider
    .otherwise '/404'

    $stateProvider

    .state 'abslogin'
    ,
      template: '<div ui-view></div>'
      abstract: true
      resolve:
        authorization: gResolveProvider.authorization
    .state 'home'
    ,
      parent: 'abslogin'
      url: '/'
      templateUrl: '/modules/home/index.html'
      controller: 'homeCtrl'

    .state 'portal'
    ,
      parent: 'abslogin'
      url: '/portal'
      templateUrl: '/modules/portal/index.html'
      controller: 'portalCtrl'

    .state 'visual'
    ,
      parent: 'abslogin'
      url: '/visual'
      templateUrl: '/modules/visual/index.html'
      controller: 'visualCtrl'

    .state 'bridging'
    ,
      parent: 'abslogin'
      url: '/bridging'
      templateUrl: '/modules/bridging/index.html'
      controller: 'bridgingCtrl'
    .state 'gmap'
    ,
      parent: 'abslogin'
      url: '/gmap'
      templateUrl: '/modules/gmap/index.html'
      controller: 'gmapCtrl'

    .state 'error'
    ,
      url: '/404'
      templateUrl: '/modules/404/index.html'



]