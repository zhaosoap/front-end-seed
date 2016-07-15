angular.module 'Seed'

.classy.controller

  name: 'homeCtrl'

  inject: [
    '$scope'
    '$rootScope'
    'apiData'
    'apiRun'
    'CONFIG'
    '$state'
  ]

  initScope: -> null

  data: null


  init: -> null



  methods:
    goPositioning: ->
      @$state.go '404'

    goBridging: ->
      @$state.go '404'



