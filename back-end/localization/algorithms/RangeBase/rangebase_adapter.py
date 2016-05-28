
def formatInput(reqJson):

    return reqJson

def getCond(reqJson):
    cond = {
        'status': 'COMPLETED',
        'experiment.name': 'ALG_RangeBase_expt',
    }

    cond['config.criteria.testSet'] = reqJson['testSet']
    return cond
