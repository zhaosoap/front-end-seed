angular.module 'Seed'
.classy.controller
  name: 'page1Ctrl'
  inject: [
    '$scope'
    '$rootScope'
    '$state'
  ]
  initScope: ->
    hello: 'This is a new page.'
    user:
      name: null
  data: null
  init: -> null
  methods:
    btnFunc: () ->
      @$scope.user.name = 'button clicked.'


