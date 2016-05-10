angular.module 'TDLV'

.classy.controller

  name: 'footerCtrl'

  inject: [
    '$scope'
    '$state'
    ]

  init: -> null

  methods:
    goToAgr: ->
      @$state.go 'agreement'
