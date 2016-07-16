angular.module 'Seed'

.factory 'apiUserBase', [
  'Restangular'
  'CONFIG'
  (
    Restangular
    CONFIG
  ) ->
    baseURL = "#{CONFIG.BASEURL.API_SEED}"
    Restangular.withConfig (RestangularConfigurer) ->
      RestangularConfigurer.setBaseUrl baseURL
]

.factory 'apiUser', [
  'apiUserBase'
  'AUTH'
  (
    apiUserBase
    AUTH
  ) ->
    testGET: (input)->
      meta = apiUserBase
      .one 'testGET'
      new Promise (resolve, reject) ->
        meta.get input
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    testPOST: (input)->
      meta = apiUserBase
      .all 'testPOST'
      new Promise (resolve, reject) ->
        meta.post input
        .then (result) ->
          resolve result
        , (res) ->
          reject res

]