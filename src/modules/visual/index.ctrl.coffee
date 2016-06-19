angular.module 'TDLV'

.classy.controller

  name: 'visualCtrl'

  inject: [
    '$scope'
    '$rootScope'
    '$timeout'
    'apiData'
    'calcTool'
    'CONFIG'
    'EN'
  ]

  initScope: ->
    load1: false
    load2: false
    load3: false
    showModel : 0
    errThreshold: 0
    algResult:{}
    resultList:[]
    addResList:[]
    algList: null
    domTree: null
    showCdf: null
    resultScreen: 0
    algLoading: 1
    thisp: @

  data:
    sampleSize: null
    fullSize: null
    redIcon: null
    predIcons: []
    redStar: null
    blueStar: null
    tower: null
    GPSList: []
    CONFIG: 'CONFIG'
    EN: 'EN'
    getGreatCircleDistance: 'calcTool.getGreatCircleDistance'
    getResults: 'apiData.getResults'
    getReportList: 'apiData.getReportList'
    getReports: 'apiData.getReports'
    predGPS: []
    realGPS: []
    baseGPS: []
    showGPSIndex: []
    it:null
    predColors:['#FC5F64','#D4FF00','#3484E9','#F39C12','#BD10E0','#8B572A']
#    predColors:['#F88854','#D4FF00','#FC5F64','#F39C12','#BD10E0','#8B572A']
    display:
      isDirty : false
      map : null


    splitResults: (data) ->
      colums = _.unzip data
      {
      predGPS: _.zip colums[2], colums[3]
      realGPS: _.zip colums[4], colums[5]
      baseGPS: _.zip colums[6], colums[7]
      }

    convertFromPromise: (points)->
      new Promise (resolve, reject) ->
        AMap.convertFrom points, "gps", (error, result)->
          if error isnt "complete"
            reject error
          else resolve result

    convertGPS: (data) ->
      points = []
      x = 0
      allPromise =[]
      for pt in data
        x += 1
        points.push new AMap.LngLat pt[0], pt[1]
        if points.length>=200 or x==data.length
          allPromise.push @convertFromPromise points
          points=[]
      Promise.all allPromise
      .then (results)->
        traj = []
        for result in results
          for gps in result.locations
            traj.push new AMap.LngLat gps.lng, gps.lat
        traj
      .catch (error)->
        console.log error



    runSample: ->
      @showGPSIndex = []
      temp = @sampleSize
      tempFull = @fullSize
      for x in [0..@fullSize-1]
        roll = Math.round Math.random()*@fullSize
        if roll<temp
          @showGPSIndex.push x
          temp -=1
        tempFull -=1
      @$scope.showModel = @$scope.showModel+4

    smallerThanThreshold: (GPS,x)->
      @$scope.errThreshold > @getGreatCircleDistance GPS.predGPS[x][1],GPS.predGPS[x][0], GPS.realGPS[x][1], GPS.realGPS[x][0]




    clearDisplay: ->
      @display.map.clearMap() if @display.isDirty
      @display.showPred = []
      @display.showReal = []
      @display.isFirst = true
      @display.isDirty = false

    getAllGPS: ->
      for i in [@GPSList.length..@$scope.resultList.length-1]
        @it = i
        Promise.bind @
        .then ->
          @getResults
            'algorithm': @$scope.resultList[@it].id
            'id': @$scope.resultList[@it].algResNumber.toString()

        .then (output) ->
          @$scope.algResult = output.result
          @GPSList.push @splitResults output.data
          console.log 'begin'+@it
          @fullSize = @GPSList[0].predGPS.length
          if @it is 0
            @$scope.samplingRate = 5
            @$scope.setSamplingRate()
          else
            @$scope.showModel = @$scope.showModel+4

#        Promise.bind @
#        .then ->
#          @getResults
#            'algorithm': @$scope.resultList[@it].id
#            'id': @$scope.resultList[@it].algResNumber
#
#        .then (output) ->
#          @$scope.algResult = output.result
#          @GPSList.push @splitResults output.data
#          console.log 'begin'+@it
#          @convertGPS @GPSList[@it].predGPS
#        .then (result) ->
#          @GPSList[@it].predGPS = result
#          @convertGPS @GPSList[@it].realGPS
#        .then (result) ->
#          @GPSList[@it].realGPS = result
#          @$scope.load2 = false
#          @$scope.load1 = false
#          @fullSize = result.length
#          @$scope.samplingRate = 5
#          @convertGPS @GPSList[@it].baseGPS
#        .then (result) ->
#          console.log 'end'+@it
#          @GPSList[@it].baseGPS = result
#          @$scope.load3 = false

  init: ->
    Promise.bind @
    .then ->
      @getReportList
        trainSet : @$rootScope.trainSet
        testSet : @$rootScope.testSet
    .then (result)->
      @$scope.algList = Object.keys result.domTree
      @$scope.domTree = result.domTree

    @redIcon = new AMap.Icon
      image : 'http://'+@CONFIG.BASEURL.HOST+'/images/red-oval-7.png'
      size : new AMap.Size(7,7)
    for i in [0..5]
      @predIcons.push new AMap.Icon
        image : 'http://'+@CONFIG.BASEURL.HOST+"/images/predoval#{i}.png"
        size : new AMap.Size(7,7)
    @violetStar = new AMap.Icon
      image : 'http://'+@CONFIG.BASEURL.HOST+'/images/violet-star-7.png'
      size : new AMap.Size(10,10)
    @greenStar = new AMap.Icon
      image : 'http://'+@CONFIG.BASEURL.HOST+'/images/green-star-7.png'
      size : new AMap.Size(10,10)
    @tower = new AMap.Icon
      image : 'http://'+@CONFIG.BASEURL.HOST+'/images/radio-tower0.png'
      size : new AMap.Size(24,24)

    @display.map = new AMap.Map 'container',
      zoom : 15
      center : [121.4456,31.1986]
      mapStyle : 'blue_night'
      features: ['road']
      jogEnable : true
    window.map = @display.map

    if not @$rootScope.resultAlg
      @$rootScope.resultAlg = 'RF_roc'
    if (typeof(@$rootScope.resultId) == "undefined")
      @$rootScope.resultId = 1

    temp ={}
    temp.id = @$rootScope.resultAlg
    temp.algResNumber = @$rootScope.resultId.toString()
    @$scope.resultList.push temp
    @$scope.getRRs()

  methods:
    setVisModel1: ->
      @$scope.showModel = 0
    setVisModel2: ->
      @$scope.showModel = 1
    setVisModel3: ->
      @$scope.showModel = 2
    setVisModel4: ->
      @$scope.showModel = 3

    addResult: ->
      @$scope.addResList.push {}

    getRRs: ->
      origin= []
      for r in @$scope.resultList
        temp ={}
        temp.alg = r.id
        temp.num = r.algResNumber
        origin.push temp
      origin = origin.concat @$scope.addResList
      _.remove origin, (n)->
        not (n&&n.alg && (typeof(n.num) != "undefined"))
      origin = _.uniqWith origin, _.isEqual

      Promise.bind @
      .then ->
        @getReports origin
      .then (result) ->
        @$scope.showCdf = 'http://'+@CONFIG.BASEURL.HOST+'/'+result.cdf
        @$scope.resultList =result.reports
        @getAllGPS()
        @$scope.resultScreen = 1

    VisModel4: ->
      @clearDisplay()
      @display.isDirty = true
      markers_pred = []
      markers_real = []
      tick = 0
      for x in @showGPSIndex
        tick += 1
        @display.showPred.push @predGPS[x]
        @display.showReal.push @realGPS[x]
        markers_pred.push new AMap.Marker
          position: [@predGPS[x].lng,@predGPS[x].lat]
          icon : if @display.isFirst then @greenStar else @blueIcon
          offset : new AMap.Pixel(-5,-5)
        markers_real.push new AMap.Marker
          position: [@realGPS[x].lng,@realGPS[x].lat]
          icon : if @display.isFirst then @violetStar else @redIcon
          offset : new AMap.Pixel(-5,-5)
        @display.isFirst = false
#        if markers.length>=200 or tick==@showGPSIndex.length

#          markers = []
      window.markers_pred = markers_pred
      window.markers_real = markers_real

      window.map.plugin ['AMap.MarkerClusterer'], ()->
        sts = [{
          url: "http://'+@CONFIG.BASEURL.HOST+'/images/Oval2.png",
          size: new AMap.Size(24, 24),
          offset: new AMap.Pixel(-24, -24)
        }, {
          url: "http://'+@CONFIG.BASEURL.HOST+'/images/Oval2.png",
          size: new AMap.Size(24, 24),
          offset: new AMap.Pixel(-24, -24)
        }, {
          url: "http://'+@CONFIG.BASEURL.HOST+'/images/Oval2.png",
          size: new AMap.Size(24, 24),
          offset: new AMap.Pixel(-24, -24),
          textColor: '#CC0066'
        }];
        sts1 = [{
          url: "http://'+@CONFIG.BASEURL.HOST+'/images/Oval1.png",
          size: new AMap.Size(24, 24),
          offset: new AMap.Pixel(-24, -24)
        }, {
          url: "http://'+@CONFIG.BASEURL.HOST+'/images/Oval1.png",
          size: new AMap.Size(24, 24),
          offset: new AMap.Pixel(-24, -24)
        }, {
          url: "http://'+@CONFIG.BASEURL.HOST+'/images/Oval1.png",
          size: new AMap.Size(24, 24),
          offset: new AMap.Pixel(-24, -24),
          textColor: '#CC0066'
        }];
        cluster = new AMap.MarkerClusterer map, markers_pred,
          zoomOnClick: true
          gridSize: 20
          averageCenter: true
          styles: sts
        cluster1 = new AMap.MarkerClusterer map, markers_real,
          zoomOnClick: true
          averageCenter: true
          gridSize: 20
          styles: sts1

      pline = new AMap.Polyline
        path : @display.showPred
        strokeColor : '#3498DB'
        strokeWeight : 2
        map : @display.map
      pline1 = new AMap.Polyline
        path : @display.showReal
        strokeWeight : 2
        strokeColor : '#E74C3C'
        map : @display.map

    VisModel1: ->

      @clearDisplay()
      @display.isDirty = true
      for GPS,i in @GPSList
        @display.showPred = []
        @display.showReal = []
        for x in @showGPSIndex
          @display.showPred.push GPS.predGPS[x]
          @display.showReal.push GPS.realGPS[x]
          if @smallerThanThreshold(GPS,x)
            continue
#          marker = new AMap.Marker
#            position: [GPS.predGPS[x][0],GPS.predGPS[x][1]]
#            icon : if @display.isFirst then @greenStar else @predIcons[i]
#            offset : new AMap.Pixel(-5,-5)
#            map : @display.map
#          if i is 0
#            marker1 = new AMap.Marker
#              position: [GPS.realGPS[x][0],GPS.realGPS[x][1]]
#              icon : if @display.isFirst then @violetStar else @redIcon
#              offset : new AMap.Pixel(-5,-5)
#              map : @display.map
          @display.isFirst = false
        pline = new AMap.Polyline
          path : @display.showPred
          strokeColor : @predColors[i]
          strokeWeight : 2
#          isOutline: true
#          outlineColor: '#FFFFFF'
          map : @display.map
        if i is 0
          pline1 = new AMap.Polyline
            path : @display.showReal
            strokeWeight : 2
#            isOutline: true
#            outlineColor: '#D8D8D8'
            strokeColor : '#FFFFFF'
#            strokeColor : '#FF5500'
            map : @display.map

    VisModel2: ->
      @clearDisplay()
      @display.isDirty = true
      for GPS,i in @GPSList
        @display.showPred = []
        @display.showReal = []
        for x in @showGPSIndex
          @display.showPred.push GPS.predGPS[x]
          @display.showReal.push GPS.realGPS[x]
          if i is 0
            new AMap.Circle
              center: new AMap.LngLat(GPS.realGPS[x][0], GPS.realGPS[x][1])
              radius: 3
              strokeColor: "#FFFFFF"
              fillColor: "#FFFFFF"
              map: @display.map
          if @smallerThanThreshold(GPS,x)
            continue
          new AMap.Circle
            center: new AMap.LngLat(GPS.predGPS[x][0], GPS.predGPS[x][1])
            radius: 3
            strokeColor: @predColors[i]
            fillColor: @predColors[i]
            map: @display.map
          new AMap.Polyline
              path : [GPS.predGPS[x], GPS.realGPS[x]]
              strokeColor : @predColors[i]
              strokeStyle : 'dashed'
              strokeWeight : 1
              map : @display.map


          @display.isFirst = false

    VisModel3: ->
      @clearDisplay()
      @display.isDirty = true
      for GPS,i in @GPSList
        @display.showPred = []
        @display.showReal = []
        for x in @showGPSIndex
          @display.showPred.push GPS.predGPS[x]
          @display.showReal.push GPS.realGPS[x]
          if i is 0
            new AMap.Circle
              center: new AMap.LngLat(GPS.realGPS[x][0], GPS.realGPS[x][1])
              radius: 3
              strokeColor: "#FFFFFF"
              fillColor: "#FFFFFF"
              map: @display.map
          if @smallerThanThreshold(GPS,x)
            continue
          new AMap.Circle
            center: new AMap.LngLat(GPS.predGPS[x][0], GPS.predGPS[x][1])
            radius: 3
            strokeColor: @predColors[i]
            fillColor: @predColors[i]
            map: @display.map
          new AMap.Polyline
            path : [GPS.predGPS[x], GPS.realGPS[x]]
            strokeColor : @predColors[i]
            strokeStyle : 'dashed'
            strokeWeight : 1
            map : @display.map

          @display.isFirst = false
          if GPS.baseGPS[x][1] > 0
            marker2 = new AMap.Marker
              position: [GPS.baseGPS[x][0],GPS.baseGPS[x][1]]
              icon :  @tower
              offset : new AMap.Pixel(0,-22)
              map : @display.map
            if i is 0
              pline1 = new AMap.Polyline
                path : [GPS.realGPS[x], GPS.baseGPS[x]]
                strokeColor : '#FFFFFF'
                strokeWeight : 1
                strokeStyle : 'dashed'
                map : @display.map
            pline2 = new AMap.Polyline
              path : [GPS.predGPS[x], GPS.baseGPS[x]]
              strokeColor : @predColors[i]
              strokeStyle : 'dashed'
              strokeWeight : 1
              map : @display.map
    setSamplingRate: () ->

      @sampleSize = @fullSize*@$scope.samplingRate/100
      @runSample()

    setErrorDistance: () ->
      if @showGPSIndex.length is 0
        return
      @$scope.showModel = @$scope.showModel+4
    _setShowModel: (newValue, oldValue) ->
      if @showGPSIndex.length is 0
        return
      @$scope.VisModel1() if newValue%4 is 0
      @$scope.VisModel2() if newValue%4 is 1
      @$scope.VisModel3() if newValue%4 is 2
      @$scope.VisModel4() if newValue%4 is 3

  watch:
      '{object}showModel' : '_setShowModel'

