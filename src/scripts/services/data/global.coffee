angular.module 'Seed'

.service 'Global', [
  'AUTH'
  'apiUser'
  (
    AUTH
    apiUser
  ) ->
    return
]