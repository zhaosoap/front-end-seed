angular.module 'TDLV'

.factory 'apiDataBase', [
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

.factory 'apiData', [
  'apiDataBase'
  'AUTH'
  (
    apiDataBase
    AUTH
  ) ->
    getResults: ->
      meta = apiDataBase.one 'run'
      .one 'results'
      .one 'RF'

      new Promise (resolve, reject) ->
        meta.get()
        .then (result) ->
          resolve result
        , (res) ->
          reject res
]
