angular.module 'TDLV'

.classy.controller

  name: 'portalCtrl'

  inject: [
    '$scope'
    '$rootScope'
    'apiData'
    'apiRun'
    'CONFIG'
    '$state'
  ]

  initScope: ->
    cleanScreen: 0
    cleanLoading: 1
    cleanScreen: 0
    cleanLoading: 1
    resultScreen: 0
    algLoading: 1
    cleanConf:
      RxLevGreaterThan: -1000
      delNullLacOrCellId: false
      delNullLngOrLat: false
      isMR: false
      rawFile: null
    splitConf:
      cleanFile: null
      isRandom: false
      ratio: 80


    cleanResult:
      input:{}
      output:{}
    splitResult:
      input:{}
      output:{}
    algResult:{}

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
    runSplit: 'apiRun.runSplit'
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
    @$scope.algorithm = 'RF_roc'


  methods:
    submitCleanTask: ->
      @$scope.cleanLoading = 1
      Promise.bind @
      .then ->
        @runClean @$scope.cleanConf
      .then (result)->
        @$scope.cleanResult = result
        @$scope.cleanLoading = 0
        @refreshDirs()

      @$scope.cleanScreen ^=1

    submitSplitTask: ->
      @$scope.splitLoading = 1
      Promise.bind @
      .then ->
        @runSplit @$scope.splitConf
      .then (result)->
        @$scope.splitResult = result
        @refreshDirs()
        @$scope.splitLoading = 0

      @$scope.splitScreen ^=1

    submitTask: ->
      @$scope.algLoading = 1
      Promise.bind @
      .then ->
        @runAlgorithm
          id : @$scope.algorithm
          trainSet : @$scope.trainSet
          testSet : @$scope.testSet
          configuration : @$scope[@$scope.algorithm]
      .then (result)->
        result.cdf = 'http://'+@CONFIG.BASEURL.HOST+'/'+result.cdf
        @$scope.algResult = result
        @$scope.algLoading = 0
      @$scope.resultScreen = 1

    goVisualize: ->
      @$rootScope.resultAlg = @$scope.algorithm
      @$rootScope.resultId = @$scope.algResult.algResNumber
      @$state.go 'visual'

    _changeTemplate: (newValue, oldValue)->
      @$scope.template = _.find(@$scope.templates, ['name', newValue]);

  watch:
    '{object}algorithm': '_changeTemplate'
