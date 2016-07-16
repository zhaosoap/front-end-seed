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
      @$state.go 'page1'

    goBridging: ->
      @$state.go 'page2'



