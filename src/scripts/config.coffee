angular.module 'TDLV'

.factory 'CONFIG', ->

  local = window.location.hostname
#  base_host = '115.28.215.182:5000'
#  base_host = '210.6.28.98:5000'
#  base_host = '0.0.0.0:5000'
  base_host = local + ':5000'

  test_host = '172.17.3.143'
  host = base_host
  api = "#{host}/api"

  BASEURL:
    LOCAL: local
    HOST: host
    API_TDLV: "http://#{api}"

