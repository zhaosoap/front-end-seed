angular.module 'TDLV'

.factory 'apiFileBase', [
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

.factory 'apiUploadFile', [
  'apiFileBase'
  'Upload'
  (
    apiFileBase
    Upload
  ) ->

    beginUploadFile: (upload_file_data) ->
      {
      token
      } = upload_file_data
      meta = apiFileBase.one 'print_task'
      .all 'begin_create'

#      token = AUTH.token()
      token = null unless token

      new Promise (resolve, reject) ->
        meta.post
          token: token
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    endUploadFile: (file) ->
      {
      key
      token
      file_name
      file_length
      file_type
      } = file

      meta = apiFileBase.one 'print_task'
      .all 'end_create'

      new Promise (resolve, reject) ->
        meta.post
          key: key
          token: token
          file_name: file_name
          file_length: file_length
          file_type: file_type
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    uploadFile: (filewrap, url, resultchain) ->
      new Promise (resolve, reject) ->

        fileReader = new FileReader()
        fileReader.readAsArrayBuffer filewrap.file
        fileReader.onload = (e) ->
          content_type = 'application/octet-stream'
          filewrap.thread = Upload.http
            url: url
            data: e.target.result
            method: 'PUT'
            headers:
              'Accept': '*/*'
              'Content-Type': content_type
          .progress (evt) ->
            progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            filewrap.progress = progressPercentage
          .success (data, status, headers, config) ->
            if status >= 200 and status < 300
              filewrap.complete = true
              resolve resultchain
            else
              filewrap.failed = true
              reject false
          .error (e) ->
            filewrap.failed = true
            reject e
        fileReader.error = (e) ->
          filewrap.failed = true
          reject e
]
.factory 'apiFile', [
  'apiFileBase'
  'AUTH'
  (
    apiFileBase
    AUTH
  ) ->
    updatePtk: (task) ->
      {
        print_task_id
        bothside
        copies
        handouts
      } = task

      meta = apiFileBase.one 'print_task'
      .all 'update'

      token = AUTH.token()
      token = null unless token

      new Promise (resolve, reject) ->
        meta.post
          token: token
          print_task_id: print_task_id
          bothside: bothside
          copies: copies
          handouts: handouts
        .then (result) ->
          resolve result
        , (res) ->
          reject res

    removePtk: (task) ->
      {
        token
        print_task_id
      } = task

      meta = apiFileBase.one 'print_task'
      .all 'remove'

      new Promise (resolve, reject) ->
        meta.post
          token: token
          print_task_id: print_task_id
        .then (result) ->
          resolve result
        , (res) ->
          reject res




]