angular.module 'TDLV'

.classy.controller

  name: 'bridgingCtrl'

  inject: [
    '$scope'
    '$timeout'
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
    mfping: false
    sping: false

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

    start1 = [
      [121.500968,31.281836],
      [121.502856,31.282753],
      [121.505067,31.281946],
      [121.506182,31.281598],
      [121.505152,31.27969],
      [121.50247,31.275674],
      [121.498436,31.272043],
      [121.494424,31.268448],
      [121.490969,31.264138],
      [121.486849,31.254013],
      [121.484145,31.251775]
    ]
    end1 = [
      [121.432475,31.219796],
      [121.428377,31.218603],
      [121.423098,31.218878],
      [121.420137,31.218933],
      [121.416639,31.218218],
      [121.415738,31.217961]
    ]
    @display.map = new AMap.Map 'container',
      zoom : 15
      center : [121.4456,31.1986]
      mapStyle : 'blue_night'
      features: ['road','point']
      jogEnable : true
    window.map = @display.map
    new AMap.Polyline
      path : start1
      strokeWeight : 8
      strokeColor : '#FC5F64'
      map : @display.map
    new AMap.Polyline
      path : end1
      strokeWeight : 8
      strokeColor : '#FC5F64'
      map : @display.map


    @display.map.setFitView()

  methods:
    setSP: ->
      AMap.plugin ['AMap.Driving','AMap.Walking','AMap.Transfer']
      , ()->
        driving = new AMap.Driving
          map: window.map


        driving.search new AMap.LngLat(121.484145,31.251775)
        , new AMap.LngLat(121.432475,31.219796)

        walking = new AMap.Walking
          map: window.map
        walking.search new AMap.LngLat(121.484145,31.251775)
        , new AMap.LngLat(121.432475,31.219796)

        transfer = new AMap.Transfer
          map: window.map
          strokeWeight : 8
          strokeColor : '#FC5F64'


        transfer.search new AMap.LngLat(121.484145,31.251775)
        , new AMap.LngLat(121.432475,31.219796)
    delayMFP: ->
      @$scope.mfping = true

      @$timeout(@$scope.setMFP,3000)
    setMFP: ->

      closeInfoWindow = ()->
        window.map.clearInfoWindow()
      createInfoWindow = (title, content)->
        info = document.createElement("div");
        info.className = "info";
        info.style.width = '285px'
        top = document.createElement("div");
        closeX = document.createElement("img");
        top.style.backgroundColor = 'white';
        top.className = "info-top";

        closeX.src = "http://webapi.amap.com/images/close2.gif";
        closeX.onclick = closeInfoWindow
        closeX.style.float = 'right'
        closeX.style.margin = '10px'

        top.appendChild(closeX);
        info.appendChild(top);

        middle = document.createElement("div");
        middle.className = "info-middle";
        middle.style.backgroundColor = 'white';
        middle.innerHTML = content;
        info.appendChild(middle);

        bottom = document.createElement("div");
        bottom.className = "info-bottom";
        bottom.style.position = 'relative';
        bottom.style.top = '0px';
        bottom.style.margin = '-3px auto';
        sharp = document.createElement("img");
        sharp.src = "./styles/image/rightsharp.png"
        bottom.appendChild(sharp);
        info.appendChild(bottom)
        info

      mfp = [
        [121.484145,31.251775],
        [121.481227,31.248143],
        [121.482214,31.245171],
        [121.482428,31.24363],
        [121.471571,31.242089],
        [121.460327,31.241355],
        [121.458954,31.240401],
        [121.45758,31.238089],
        [121.458095,31.231521],
        [121.45904,31.229429],
        [121.448869,31.224585],
        [121.438741,31.219741],
        [121.432475,31.219796]
      ]
      new AMap.Polyline
        path : mfp
        strokeWeight : 8
        strokeColor : '#D4FF00'
        map : window.map
      title = 'MFP'
      content = []
      content.push "<div><div style=\"padding:0px 0px 0px 0px;\">同时段经过红色路段8761人"
      content.push "绿色路段为最频繁路径（MFP）有5462人（62.3%）通过。"
#      content.push "应用相似时段和用户最频繁路径MFP（most frequent path）预测</div></div>"
      infoWindow = new AMap.InfoWindow
        isCustom: true
        content: createInfoWindow(title, content.join("<br/>"))
        offset: new AMap.Pixel(-50, -10)

      infoWindow.open window.map, [121.458954,31.240401]
      @$scope.mfping = false




addResult: ->
      @$scope.addResList.push {}



