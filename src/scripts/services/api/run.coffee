angular.module 'TDLV'

.factory 'apiRunBase', [
  'Restangular'
  'CONFIG'
  (
    Restangular
    CONFIG
  ) ->
    baseURL = "#{CONFIG.BASEURL.API_TDLV}"
    Restangular.withConfig (RestangularConfigurer) ->
      RestangularConfigurer.setBaseUrl baseURL
]

.factory 'apiRun', [
  'apiRunBase'
  'AUTH'
  (
    apiRunBase
    AUTH
  ) ->
    runAlgorithm: (input)->
      {
        id
        trainSet
        testSet
        configuration
      } = input
      meta = apiRunBase.one 'run'
      .all 'algorithm'
      new Promise (resolve, reject) ->
        meta.post
          id: id
          trainSet: trainSet
          testSet: testSet
          configuration: configuration
        .then (result) ->
          resolve result
        , (res) ->
          reject res


]