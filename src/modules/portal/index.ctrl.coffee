angular.module 'TDLV'

.classy.controller

  name: 'portalCtrl'

  inject: [
    '$scope'
  ]

  initScope: -> null

  data: null

  init: ->
    @$scope.templates =
      [
        { name: 'DT', url: '/modules/algorithm/DT.html'},
        { name: 'RF', url: '/modules/algorithm/RF.html'},
        { name: 'RNN', url: '/modules/algorithm/RNN.html'},
        { name: 'MLP', url: '/modules/algorithm/MLP.html'},
      ];
    @$scope.template = @$scope.templates[1];


  methods:
    _changeTemplate: (newValue, oldValue)->
      @$scope.template = _.find(@$scope.templates, ['name', newValue]);

  watch:
    '{object}algorithm': '_changeTemplate'
