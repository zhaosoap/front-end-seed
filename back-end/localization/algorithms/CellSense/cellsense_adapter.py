
def formatInput(reqJson):
    ((ld_lon, ld_lat), (ru_lon, ru_lat)) = reqJson['configuration']['area']
    reqJson['configuration']['area'] = ((float(ld_lon), float(ld_lat)), (float(ru_lon), float(ru_lat)))
    grid_size = reqJson['configuration']['grid_size']
    reqJson['configuration']['grid_size'] = float(grid_size)
    default_std = reqJson['configuration']['default_std']
    reqJson['configuration']['default_std'] = float(default_std)

    return reqJson

def getCond(reqJson):
    cond = {
        'status': 'COMPLETED',
        'experiment.name': 'ALG_CellSense_expt',
    }

    cond['config.criteria.trainSet'] = reqJson['trainSet']
    cond['config.criteria.testSet'] = reqJson['testSet']
    cond['config.criteria.configuration.grid_size'] = reqJson['configuration']['grid_size']
    cond['config.criteria.configuration.default_std'] = reqJson['configuration']['default_std']
    cond['config.criteria.configuration.area'] = reqJson['configuration']['area']
    return cond
