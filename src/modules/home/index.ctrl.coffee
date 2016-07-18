angular.module 'Seed'

.classy.controller

  name: 'homeCtrl'

  inject: [
    '$scope'
    '$rootScope'
    'CONFIG'
    '$state'
  ]

  initScope: -> null

  data: null


  init: -> null



  methods:
    goPositioning: ->
      @$state.go 'page2'

    goBridging: ->
      @$state.go 'error'



