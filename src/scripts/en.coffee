angular.module 'TDLV'

.factory 'EN', ->
  {
    RB: 'Range based'
    CS: 'Fingerprint(CellSense)'
    RF_roc: 'Two-Layer RF regression'
    RF_classify: 'RF grid with filter'
    MLP_aus: 'MultiLayer Perceptron'
    DT:'Two-layer DT regression'
  }


