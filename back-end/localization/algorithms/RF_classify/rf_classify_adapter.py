
def formatInput(reqJson):
    for k,v in reqJson['configuration'].iteritems():
        if k=='bootstrap':
            try:
                boolV = bool(v)
                reqJson['configuration'][k] = boolV
                continue
            except: None
        if k=='max_features':
            try:
                floatV = float(v)
                reqJson['configuration'][k] = floatV
                continue
            except: None
        try:
            intV = int(v)
            reqJson['configuration'][k] = intV
        except: None
    reqJson['configuration']['grid_size'] = int(reqJson['configuration']['grid_size'])
    reqJson['configuration']['top_n'] = int(reqJson['configuration']['top_n'])
    reqJson['configuration']['filter_win_size'] = int(reqJson['configuration']['filter_win_size'])
    reqJson['configuration']['filter_iters'] = int(reqJson['configuration']['filter_iters'])
    return reqJson

def getCond(reqJson):
    cond = {
        'status': 'COMPLETED',
        'experiment.name': 'ALG_RF_classify_expt'
    }
    for k,v in reqJson['configuration'].iteritems():
        cond['config.criteria.configuration.'+k] = v
    cond['config.criteria.trainSet'] = reqJson['trainSet']
    cond['config.criteria.testSet'] = reqJson['testSet']
    cond['config.criteria.configuration.grid_size'] = reqJson['configuration']['grid_size']
    cond['config.criteria.configuration.top_n'] = reqJson['configuration']['top_n']
    cond['config.criteria.configuration.filter_win_size'] = reqJson['configuration']['filter_win_size']
    cond['config.criteria.configuration.filter_iters'] = reqJson['configuration']['filter_iters']
    return cond
