angular.module 'TDLV'

.classy.controller

  name: 'portalCtrl'

  inject: [
    '$scope'
    'apiData'
    'apiRun'
  ]

  initScope: ->
    cleanScreen: 0
    cleanLoading: 1
    cleanConf:
      RxLevGreaterThan: -1000
      delNullLacOrCellId: false
      delNullLngOrLat: false
      isMR: false
      rawFile: null
    splitConf:
      cleanFile: null
      splitWay: 0
      ratio: 80


    cleanResult:
      input:{}
      output:{}

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
    runClean: 'apiRun.runClean'

    refreshDirs: ->
      dirs = ['train','test','raw','clean']
      Promise.bind @
      .then ->
        @getFileList
          dirs: dirs
      .then (result)->
        for key, val of result.fileLists
          @$scope[key+'FileList']=val

  init: ->
    @refreshDirs()
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
    submitCleanTask: ->

      Promise.bind @
      .then ->
        @runClean @$scope.cleanConf
      .then (result)->
        @$scope.cleanResult = result
        @$scope.cleanLoading = 0
        @refreshDirs()

      @$scope.cleanScreen ^=1

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
