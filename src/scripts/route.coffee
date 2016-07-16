angular.module 'Seed'

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
    .state 'page1'
    ,
      url: '/page1'
      templateUrl: '/modules/page1/index.html'
      controller: 'page1Ctrl'

    .state 'page2'
    ,
      url: '/page2'
      templateUrl: '/modules/page2/index.html'
      controller: 'page2Ctrl'

    .state 'error'
    ,
      url: '/404'
      templateUrl: '/modules/404/index.html'



]