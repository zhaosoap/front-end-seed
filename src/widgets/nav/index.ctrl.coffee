angular.module 'Seed'

.classy.controller

  name: 'navCtrl'

  inject: [
    '$scope'
    '$state'
    'Global'
    'AUTH'
    'Location'
  ]

  initScope: ->
    school: null

  data: null


  init: -> null


  methods:
    goHome: ->
      @$state.go 'home'
  watch: null

