angular.module 'Seed'

.factory 'CONFIG', ->

  local = window.location.hostname
  base_host = local + ':5000'

  test_host = '172.17.3.143'
  host = base_host
  api = "#{host}/api"

  BASEURL:
    LOCAL: local
    HOST: host
    API_SEED: "http://#{api}"

