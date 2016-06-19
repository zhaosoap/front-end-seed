angular.module 'TDLV'

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
      @$state.go 'portal'

    goBridging: ->
      @$state.go 'bridging'



