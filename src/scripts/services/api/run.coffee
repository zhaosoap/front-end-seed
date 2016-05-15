angular.module 'TDLV'

.factory 'apiUserBase', [
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

.factory 'apiUser', [
  'apiUserBase'
  'AUTH'
  (
    apiUserBase
    AUTH
  ) ->
    getProvinces: ->
      meta = apiUserBase.one 'geography'
      .one 'provinces'

      new Promise (resolve, reject) ->
        meta.get()
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    getCities: (proid) ->

      meta = apiUserBase.one 'geography'
      .one 'cities'

      new Promise (resolves, reject) ->
        meta.get
          province: proid
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    getSchools: (ctid) ->

      meta = apiUserBase.one 'geography'
      .one 'schools'

      new Promise (resolves, reject) ->
        meta.get
          city: ctid
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    getDorms: (shid) ->
      meta = apiUserBase.one 'geography'
      .one 'buildings'

      new Promise (resolves, reject) ->
        meta.get
          school: shid
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    getShops: (build) ->
      meta = apiUserBase.one 'geography'
      .one 'shops'

      new Promise (resolves, reject) ->
        meta.get
          building: build
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    getShopDeliveryTime: (shop) ->
      meta = apiUserBase.one 'geography'
      .one 'shop_delivery_time'

      new Promise (resolves, reject) ->
        meta.get
          shopId: shop
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    registerCheck: (register_check_data) ->
      {
      cellphone
      } = register_check_data
      meta = apiUserBase.one 'student'
      .one 'check_register'
      new Promise (resolve, reject) ->
        meta.get
          cellphone: cellphone
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    login: (cepa) ->
      {
        cellphone
        password
      } = cepa

      meta = apiUserBase.one 'student'
      .all 'login'

      token = AUTH.token()
      token = null unless token

      new Promise (resolves, reject) ->
        meta.post
          cellphone: cellphone
          password: password
          token: token
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    register: (rinfo) ->
      {
      cellphone
      password
      } = rinfo

      meta = apiUserBase.one 'student'
      .all 'register'
      new Promise (resolves, reject) ->
        meta.post
          cellphone: cellphone
          passwordSent: password
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    verification: (vinfo) ->
      {
        cellphone
        reason
      } = vinfo

      meta = apiUserBase.one 'verification'
      .one 'send'

      new Promise (resolves, reject) ->
        meta.get
          cellphone: cellphone
          reason: reason
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    getUserInfo: ->
      meta = apiUserBase.one 'student'
      .one 'info'
      token = AUTH.token()
      token = null unless token

      new Promise (resolves, reject) ->
        meta.get
          token: token
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    resetPassword: (info)->
      {
        cellphone
        verficationCode
        newPassword
      } = info
      meta = apiUserBase.one 'student'
      .all 'reset_password'
      new Promise (resolves, reject) ->
        meta.post
          cellphone: cellphone
          verfication_code: verficationCode
          password: newPassword
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    logout: ->
      meta = apiUserBase.one 'student'
      .all 'logout'
      token = AUTH.token()
      token = null unless token

      new Promise (resolves, reject) ->
        meta.post
          token: token
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    listCart: ->
      meta = apiUserBase.one 'student'
      .one 'print_task'
      .one 'list_in_cart'

      token = AUTH.token()
      token = null unless token

      new Promise (resolves, reject) ->
        meta.get
          token: token
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    hasPaidOrderToday: ->
      meta = apiUserBase.one 'student'
      .one 'has_discount_today'

      token = AUTH.token()
      token = null unless token
      new Promise (resolves, reject) ->
        meta.get
          token: token
        .then (result) ->
          resolves result
        , (res) ->
          reject res

    listPrintOrders: ->

      meta = apiUserBase.one 'student'
      .one 'list_print_orders'

      token = AUTH.token()
      token = null unless token
      new Promise (resolves, reject) ->
        meta.get
          token: token
        .then (result) ->
          resolves result
        , (res) ->
          reject res


]