angular.module 'Seed'
.classy.controller
  name: 'page1Ctrl'
  inject: [
    '$scope'
    '$rootScope'
    '$state'
    'apiUser'
  ]
  initScope: ->
    hello: 'This is a new page.'
    user:
      name: null
  data:
    apiUser: 'apiUser'
  init: -> null
  methods:
    btnFunc: () ->
      @$scope.user.name = 'button clicked.'

    callGET: (arg) ->
      Promise.bind @
      .then ->
        @apiUser.testGET arg

      .then (out)->
        @$scope.user.name = out.result
      .catch (err) ->
        console.log err

    callPOST: (arg) ->
      Promise.bind @
      .then ->
        @apiUser.testPOST arg
      .then (out)->
        @$scope.user.name = out.result
      .catch (err) ->
        console.log err


