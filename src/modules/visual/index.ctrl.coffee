angular.module 'TDLV'

.classy.controller

  name: 'visualCtrl'

  inject: [
    '$scope'
    'apiData'
    'calcTool'
  ]

  initScope: ->
    load1: true
    load2: true
    load3: true
    showModel : 0
    errThreshold: 0
  data:
    sampleSize: null
    fullSize: null
    redIcon: null
    blueIcon: null
    redStar: null
    blueStar: null
    tower: null
    getGreatCircleDistance: 'calcTool.getGreatCircleDistance'
    getResults: 'apiData.getResults'
    predGPS: []
    realGPS: []
    baseGPS: []
    showGPSIndex: []
    display:
      isDirty : false
      map : null


    splitResults: (data) ->
      colums = _.unzip data
      @predGPS = _.zip colums[2], colums[3]
      @realGPS = _.zip colums[4], colums[5]
      @baseGPS = _.zip colums[6], colums[7]

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

      allPromise
      Promise.all allPromise
      .then (results)->
        traj = []
        for result in results
          for gps in result.locations
            traj.push new AMap.LngLat gps.lng, gps.lat
        traj
      .catch (error)->
        console.log error
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
      @$scope.showModel = @$scope.showModel+3

    runFilter: ->

      filterOut =[]
      for x in @showGPSIndex
        if @$scope.errThreshold < @getGreatCircleDistance @predGPS[x].lat,@predGPS[x].lng, @realGPS[x].lat, @realGPS[x].lng
          filterOut.push x
      @showGPSIndex = filterOut

      @$scope.showModel = @$scope.showModel+3

    clearDisplay: ->
      @display.map.clearMap() if @display.isDirty
      @display.showPred = []
      @display.showReal = []
      @display.isFirst = true
      @display.isDirty = false

  init: ->
    @redIcon = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/red-oval-7.png'
      size : new AMap.Size(7,7)
    @blueIcon = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/blue-oval-7.png'
      size : new AMap.Size(7,7)
    @violetStar = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/violet-star-7.png'
      size : new AMap.Size(10,10)
    @greenStar = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/green-star-7.png'
      size : new AMap.Size(10,10)
    @tower = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/tower.png'
      size : new AMap.Size(24,24)

    @display.map = new AMap.Map 'container',
      zoom : 15
      center : [121.4456,31.1986]
      mapStyle : 'fresh'
      features: ['road']

    Promise.bind @
    .then ->
      @getResults()
    .then (result) ->
      @splitResults result
      @convertGPS @predGPS
    .then (result) ->
      @predGPS = result
      @convertGPS @realGPS
    .then (result) ->
      @realGPS = result
      @$scope.load2 = false
      @$scope.load1 = false
      @fullSize = result.length
      @$scope.samplingRate = 5
#      @$scope._setSamplingRate()
      @convertGPS @baseGPS
    .then (result) ->
      @baseGPS = result
      @$scope.load3 = false



  methods:
    setVisModel1: ->
      @$scope.showModel = 0
    setVisModel2: ->
      @$scope.showModel = 1
    setVisModel3: ->
      @$scope.showModel = 2
    VisModel1: ->

      @clearDisplay()
      @display.isDirty = true
      for x in @showGPSIndex
        @display.showPred.push @predGPS[x]
        @display.showReal.push @realGPS[x]
        marker = new AMap.Marker
          position: [@predGPS[x].lng,@predGPS[x].lat]
          icon : if @display.isFirst then @greenStar else @blueIcon
          offset : new AMap.Pixel(-5,-5)
          map : @display.map
        marker1 = new AMap.Marker
          position: [@realGPS[x].lng,@realGPS[x].lat]
          icon : if @display.isFirst then @violetStar else @redIcon
          offset : new AMap.Pixel(-5,-5)
          map : @display.map
        @display.isFirst = false
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

    VisModel2: ->
      @clearDisplay()
      @display.isDirty = true
      for x in @showGPSIndex
        marker = new AMap.Marker
          position: [@predGPS[x].lng,@predGPS[x].lat]
          icon : if @display.isFirst then @greenStar else @blueIcon
          offset : new AMap.Pixel(-5,-5),
          map : @display.map
        marker1 = new AMap.Marker
          position: [@realGPS[x].lng,@realGPS[x].lat]
          icon : if @display.isFirst then @violetStar else @redIcon
          offset : new AMap.Pixel(-5,-5),
          map : @display.map
        pline = new AMap.Polyline
          path : [@predGPS[x], @realGPS[x]]
          strokeColor : '#16A085'
          strokeStyle : 'dashed'
          strokeWeight : 2
          map : @display.map
        @display.isFirst = false

    VisModel3: ->
      @clearDisplay()
      @display.isDirty = true
      for x in @showGPSIndex
        @display.showPred.push @predGPS[x]
        @display.showReal.push @realGPS[x]
        marker = new AMap.Marker
          position: [@predGPS[x].lng,@predGPS[x].lat]
          icon : if @display.isFirst then @greenStar else @blueIcon
          offset : new AMap.Pixel(-5,-5),
          map : @display.map
        marker1 = new AMap.Marker
          position: [@realGPS[x].lng,@realGPS[x].lat]
          icon : if @display.isFirst then @violetStar else @redIcon
          offset : new AMap.Pixel(-5,-5),
          map : @display.map
        pline = new AMap.Polyline
          path : [@predGPS[x], @realGPS[x]]
          strokeColor : '#16A085'
          strokeWeight : 2
          map : @display.map
        @display.isFirst = false
        if @baseGPS[x].lat > 0
          marker2 = new AMap.Marker
            position: [@baseGPS[x].lng,@baseGPS[x].lat]
            icon :  @tower
            offset : new AMap.Pixel(0,-22),
            map : @display.map
          pline1 = new AMap.Polyline
            path : [@realGPS[x], @baseGPS[x]]
            strokeColor : '#95A5A6'
            strokeStyle : 'dashed'
            map : @display.map
          pline2 = new AMap.Polyline
            path : [@predGPS[x], @baseGPS[x]]
            strokeColor : '#BDC3C7'
            strokeStyle : 'dashed'
            map : @display.map
    _setSamplingRate: (newValue, oldValue) ->
      @sampleSize = @fullSize*newValue/100
      @runSample()
      @runFilter()
    _setErrorDistance: (newValue, oldValue) ->
      if @showGPSIndex.length is 0
        return
      @runFilter()
    _setShowModel: (newValue, oldValue) ->
      if @showGPSIndex.length is 0
        return
      @$scope.VisModel1() if newValue%3 is 0
      @$scope.VisModel2() if newValue%3 is 1
      @$scope.VisModel3() if newValue%3 is 2

  watch:
      '{object}samplingRate' : '_setSamplingRate'
      '{object}errThreshold' : '_setErrorDistance'
      '{object}showModel' : '_setShowModel'

