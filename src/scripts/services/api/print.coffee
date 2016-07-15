angular.module 'Seed'

.factory 'apiModelBase', [
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

.factory 'apiModel', [
  'apiModelBase'
  'AUTH'
  'CONFIG'
  (
    apiModelBase
    AUTH
    CONFIG
  ) ->
    create: (info) ->
      {
        printShopId
        orderCellphone
        orderDorm
        orderNote
        orderTime
        delivery_building_id
      } = info

      meta = apiModelBase.one 'print_order'
      .all 'create'
      token = AUTH.token()
      token = null unless token

      new Promise (resolve, reject) ->
        meta.post
          token: token
          printShopId: printShopId
          orderCellphone: orderCellphone
          delivery_room: orderDorm
          delivery_note: orderNote
          delivery_building_id: delivery_building_id
          delivery_time: orderTime
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    purchase: (order) ->
      {
      printOrderId
      delivery_time
      delivery_note
      } = order

      token = AUTH.token()
      token = null unless token
      location.href = CONFIG.BASEURL.API_TDLV +
          '/print_order/purchase?printOrderId='+printOrderId+
          '&token=' +token
      return

      meta = apiModelBase.one 'print_order'
      .get 'purchase'

      new Promise (resolve, reject) ->
        meta.post
          token: token
          printOrderId: printOrderId
          delivery_time: delivery_time
          delivery_note: delivery_note
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    cancelOrder: (order) ->
      {
        printOrderId
      } = order
      meta = apiModelBase.one 'print_order'
      .all 'cancel'

      token = AUTH.token()
      token = null unless token

      new Promise (resolve, reject) ->
        meta.post
          token: token
          printOrderId: printOrderId
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    getOrderInfo: (order) ->
      {
        id
      } = order
      meta = apiModelBase.one 'student'
      .one 'orderinfo'

      token = AUTH.token()
      token = null unless token

      new Promise (resolve, reject) ->
        meta.get
          token: token
          printorder_id: id
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    getPages: (file) ->
      {
        filelink_id
      } = file

      meta = apiModelBase.one 'file'
      .one 'pages'
      token = AUTH.token()
      token = null unless token

      new Promise (resolve, reject) ->
        meta.get
          token: token
          filelink_id: filelink_id
        .then (result) ->
          resolve result
        , (res) ->
          reject res


]