def formatInput(reqJson):
    return reqJson

def getCond(reqJson):
    cond = {
        'status': 'COMPLETED',
        'experiment.name': 'ALG_MLP_aus_expt'
    }
    for k,v in reqJson['configuration']['layer1'].iteritems():
        cond['config.criteria.configuration.layer1.'+k] = v
    for k,v in reqJson['configuration']['layer2'].iteritems():
        cond['config.criteria.configuration.layer2.'+k] = v
    cond['config.criteria.trainSet'] = reqJson['trainSet']
    cond['config.criteria.testSet'] = reqJson['testSet']
    return cond
