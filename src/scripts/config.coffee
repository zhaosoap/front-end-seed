angular.module 'TDLV'

.factory 'CONFIG', ->

  local = window.location.origin
  base_host = 'http://115.28.215.182:5000'
  test_host = '172.17.3.143'
  host = base_host
  api = "#{host}/api"

  BASEURL:
    LOCAL: local
    HOST: host
    API_TDLV: "http://#{api}"

