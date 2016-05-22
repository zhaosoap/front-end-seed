
def formatInput(reqJson):
    for layer in ['layer1','layer2']:
        for k,v in reqJson['configuration'][layer].iteritems():
            if k=='bootstrap':
                try:
                    boolV = bool(v)
                    reqJson['configuration'][layer][k] = boolV
                    continue
                except: None
            if k=='max_features':
                try:
                    floatV = float(v)
                    reqJson['configuration'][layer][k] = floatV
                    continue
                except: None
            try:
                intV = int(v)
                reqJson['configuration'][layer][k] = intV
            except: None
    return reqJson

def getCond(reqJson):
    cond = {
        'status': 'COMPLETED',
        'experiment.name': 'ALG_RF_roc_expt'
    }
    for k,v in reqJson['configuration']['layer1'].iteritems():
        cond['config.criteria.configuration.layer1.'+k] = v
    for k,v in reqJson['configuration']['layer2'].iteritems():
        cond['config.criteria.configuration.layer2.'+k] = v
    cond['config.criteria.trainSet'] = reqJson['trainSet']
    cond['config.criteria.testSet'] = reqJson['testSet']
    return cond
