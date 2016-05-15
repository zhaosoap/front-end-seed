angular.module 'TDLV'

.classy.controller

  name: 'visualCtrl'

  inject: [
    '$scope'
    'apiData'
  ]

  initScope: ->
    load1: true
    load2: true
    load3: true

  data:
    sampleSize: null
    fullSize: null
    redIcon: null
    blueIcon: null
    redStar: null
    blueStar: null
    tower: null
    getResults: 'apiData.getResults'
    predGPS: []
    realGPS: []
    baseGPS: []
    showGPSIndex: []
    map: null
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

    runSample: () ->
      @showGPSIndex = []
      temp = @sampleSize
      tempFull = @fullSize
      for x in [0..@fullSize-1]
        roll = Math.round Math.random()*resSize
        if roll<temp
          @showGPSIndex.push x
          temp -=1
        tempFull -=1



  init: ->
    sampleSize = @predGPS.length/50
    resSize = @predGPS.length
    redIcon = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/red-oval-7.png'
      size : new AMap.Size(7,7)
    blueIcon = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/blue-oval-7.png'
      size : new AMap.Size(7,7)
    redStar = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/Star1.png'
      size : new AMap.Size(10,10)
    blueStar = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/Star3.png'
      size : new AMap.Size(10,10)
    tower = new AMap.Icon
      image : 'http://0.0.0.0:5000/images/tower.png'
      size : new AMap.Size(24,24)

    @map = new AMap.Map 'container',
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
      @convertGPS @baseGPS
    .then (result) ->
      @baseGPS = result
      @$scope.load3 = false



  methods:
    setSampleRatio: (x) ->
      @sampleSize = @fullSize*x/1000
      @runSample()

    setVisModel1: () ->
      sampleSize = @predGPS.length/50
      resSize = @predGPS.length
      redIcon = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/tl3.png'
        size : new AMap.Size(24,24)
      blueIcon = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/tl1.png'
        size : new AMap.Size(24,24)
      redStar = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/Star1.png'
        size : new AMap.Size(24,24)
      blueStar = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/Star3.png'
        size : new AMap.Size(24,24)
      showPred = []
      showReal = []
      isFirst = true
      for x in [0..@predGPS.length-1]
        roll = Math.round Math.random()*resSize
        if roll<sampleSize
          showPred.push @predGPS[x]
          showReal.push @realGPS[x]
          marker = new AMap.Marker
            position: [@predGPS[x].lng,@predGPS[x].lat]
            icon : if isFirst then blueStar else blueIcon
            offset : new AMap.Pixel(0,-22),
            map : @map
          marker1 = new AMap.Marker
            position: [@realGPS[x].lng,@realGPS[x].lat]
            icon : if isFirst then redStar else redIcon
            offset : new AMap.Pixel(0,-22),
            map : @map
          isFirst = false
          sampleSize -= 1
        resSize -= 1
      pline = new AMap.Polyline
        path : showPred
        strokeColor : '#3498DB'
        map : @map
      pline1 = new AMap.Polyline
        path : showReal
        strokeColor : '#E74C3C'
        map : @map

    setVisModel2: () ->
      sampleSize = @predGPS.length/50
      resSize = @predGPS.length
      redIcon = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/tl3.png'
        size : new AMap.Size(24,24)
      blueIcon = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/tl1.png'
        size : new AMap.Size(24,24)
      redStar = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/Star1.png'
        size : new AMap.Size(24,24)
      blueStar = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/Star3.png'
        size : new AMap.Size(24,24)
      showPred = []
      showReal = []
      isFirst = true
      for x in [0..@predGPS.length-1]
        roll = Math.round Math.random()*resSize
        if roll<sampleSize
          showPred.push @predGPS[x]
          showReal.push @realGPS[x]
          marker = new AMap.Marker
            position: [@predGPS[x].lng,@predGPS[x].lat]
            icon : if isFirst then blueStar else blueIcon
            offset : new AMap.Pixel(0,-22),
            map : @map
          marker1 = new AMap.Marker
            position: [@realGPS[x].lng,@realGPS[x].lat]
            icon : if isFirst then redStar else redIcon
            offset : new AMap.Pixel(0,-22),
            map : @map
          pline = new AMap.Polyline
            path : [@predGPS[x], @realGPS[x]]
            strokeColor : '#16A085'
            strokeStyle : 'dashed'
            map : @map
          isFirst = false
          sampleSize -= 1
        resSize -= 1

    setVisModel3: () ->
      sampleSize = @predGPS.length/50
      resSize = @predGPS.length
      redIcon = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/red-oval-7.png'
        size : new AMap.Size(7,7)
      blueIcon = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/blue-oval-7.png'
        size : new AMap.Size(7,7)
      redStar = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/Star1.png'
        size : new AMap.Size(24,24)
      blueStar = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/Star3.png'
        size : new AMap.Size(24,24)
      tower = new AMap.Icon
        image : 'http://0.0.0.0:5000/images/tower.png'
        size : new AMap.Size(24,24)
      showPred = []
      showReal = []
      isFirst = true
      for x in [0..@predGPS.length-1]
        roll = Math.round Math.random()*resSize
        resSize -= 1
        if roll<sampleSize
          showPred.push @predGPS[x]
          showReal.push @realGPS[x]
          marker = new AMap.Marker
            position: [@predGPS[x].lng,@predGPS[x].lat]
            icon : if isFirst then blueStar else blueIcon
            offset : new AMap.Pixel(-5,-5),
            map : @map
          marker1 = new AMap.Marker
            position: [@realGPS[x].lng,@realGPS[x].lat]
            icon : if isFirst then redStar else redIcon
            offset : new AMap.Pixel(-5,-5),
            map : @map
          pline = new AMap.Polyline
            path : [@predGPS[x], @realGPS[x]]
            strokeColor : '#16A085'
            strokeWeight : 2
            map : @map
          isFirst = false
          sampleSize -= 1
          if @baseGPS[x].lat > 0
            marker2 = new AMap.Marker
              position: [@baseGPS[x].lng,@baseGPS[x].lat]
              icon :  tower
              offset : new AMap.Pixel(0,-22),
              map : @map
            pline1 = new AMap.Polyline
              path : [@realGPS[x], @baseGPS[x]]
              strokeColor : '#95A5A6'
              strokeStyle : 'dashed'
              map : @map
            pline2 = new AMap.Polyline
              path : [@predGPS[x], @baseGPS[x]]
              strokeColor : '#BDC3C7'
              strokeStyle : 'dashed'
              map : @map





  watch: null
