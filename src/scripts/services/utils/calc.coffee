angular.module 'Seed'


.factory 'calcBase', [
  'CONFIG'
  (
    CONFIG
  ) ->
    EARTH_RADIUS : 6378137.0;
    getRad:(d) ->
      d*Math.PI/180.0
]
.factory 'calcTool', [
  'calcBase'
  'AUTH'
  (
    calcBase
    AUTH
  ) ->
    getGreatCircleDistance: (lat1,lng1,lat2,lng2)->
      radLat1 = calcBase.getRad(lat1)
      radLat2 = calcBase.getRad(lat2)

      a = radLat1 - radLat2
      b = calcBase.getRad(lng1) - calcBase.getRad(lng2)

      s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)))
      s = s*calcBase.EARTH_RADIUS
      s = Math.round(s*10000)/10000.0


]
