
def formatInput(reqJson):

    return reqJson

def getCond(reqJson):
    cond = {
        'status': 'COMPLETED',
        'experiment.name': 'ALG_DT_expt'
    }
    
    cond['config.criteria.trainSet'] = reqJson['trainSet']
    cond['config.criteria.testSet'] = reqJson['testSet']
    return cond
