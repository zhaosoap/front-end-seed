angular.module 'Seed'
.classy.controller
  name: 'page2Ctrl'
  inject: [
    '$scope'
    '$rootScope'
    '$state'
    'apiUser'
  ]
  initScope: ->
    hello: 'This is page2.'
    user:
      name: null
    promises: []
  data:
    apiUser: 'apiUser'
  init: -> null
  methods:
    btnFunc: () ->
      @$scope.user.name = 'button clicked.'





