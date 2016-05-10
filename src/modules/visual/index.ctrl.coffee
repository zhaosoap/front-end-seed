angular.module 'TDLV'

.classy.controller

  name: 'visualCtrl'

  inject: [
    '$scope'
  ]

  initScope: -> null

  data: null

  init: ->
    map = new AMap.Map('container');
    map.setZoom(10);
    map.setCenter([116.39,39.9]);
  methods: null

  watch: null
