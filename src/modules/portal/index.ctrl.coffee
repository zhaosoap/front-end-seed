angular.module 'TDLV'

.classy.controller

  name: 'portalCtrl'

  inject: [
    '$scope'
    'apiData'
    'apiRun'
  ]

  initScope: ->
    RF_roc:
      layer1: {}
      layer2: {}
    trainFileList: null
    testFileList: null
    rawFileList: null
    cleanFileList: null


  data:
    getFileList: 'apiData.getFileList'
    getDefaultConf: 'apiData.getDefaultConf'
    runAlgorithm: 'apiRun.runAlgorithm'

  init: ->
    dirs = ['train','test','raw','clean']
    Promise.bind @
    .then ->
      @getFileList
        dirs: dirs
    .then (result)->
      for key, val of result.fileLists
        @$scope[key+'FileList']=val

    algorithms = ['RF_roc']

    Promise.bind @
    .then ->
      @getDefaultConf
        algorithms: algorithms
    .then (result)->
      for key, val of result.defaultConfs
        @$scope[key]=val


    @$scope.templates =
      [
        { name: 'DT', url: '/modules/algorithm/DT.html'},
        { name: 'RF_roc', url: '/modules/algorithm/RF.html'},
        { name: 'RNN', url: '/modules/algorithm/RNN.html'},
        { name: 'MLP', url: '/modules/algorithm/MLP.html'},
      ];
    @$scope.template = @$scope.templates[1]


  methods:
    submitTask: ->
      Promise.bind @
      .then ->
        @runAlgorithm
          id : @$scope.algorithm
          trainSet : @$scope.trainSet
          testSet : @$scope.testSet
          configuration : @$scope[@$scope.algorithm]
      .then (result)->
        console.log result


    _changeTemplate: (newValue, oldValue)->
      @$scope.template = _.find(@$scope.templates, ['name', newValue]);

  watch:
    '{object}algorithm': '_changeTemplate'
