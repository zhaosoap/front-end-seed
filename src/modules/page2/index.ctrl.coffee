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
    hello: 'This is a new page.'
    user:
      name: null
    promises: []
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
    allPromise: ->
      @$scope.promises = []
      promises = []
      promises.push @apiUser.testGET 'p1'
      promises.push @apiUser.testPOST 'p2'
      Promise.all promises
      .bind @
      .then (out) ->
        @$scope.promises = out
      .catch (err) ->
        console.log err

    anyPromise: ->
      @$scope.promises = []
      promises = []
      promises.push @apiUser.testPOST 'p2'
      promises.push @apiUser.testGET 'p1'
      Promise.race promises
      .bind @
      .then (out) ->
        @$scope.promises[0] = out
      .catch (err) ->
        console.log err


