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
    getResults: (input)->

      meta = apiDataBase.one 'data'
      .one 'results'
      .one input.algorithm
      .one input.id

      new Promise (resolve, reject) ->
        meta.get()
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    getFileList: (input)->
      {
        dirs
      } = input
      meta = apiDataBase.one 'data'
      .all "fileList"
      new Promise (resolve, reject) ->
        meta.post
          dirs: dirs
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    getDefaultConf: (input)->
      {
        algorithms
      } = input
      meta = apiDataBase.one 'data'
      .all 'defaultConf'
      new Promise (resolve, reject) ->
        meta.post
          algorithms: algorithms
        .then (result) ->
          resolve result
        , (res) ->
          reject res

]
