angular.module 'TDLV'

.service 'Global', [
  'AUTH'
  'apiUser'
  (
    AUTH
    apiUser
  ) ->
    return
]