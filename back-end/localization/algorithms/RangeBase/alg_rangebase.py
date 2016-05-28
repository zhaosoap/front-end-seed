# coding: utf-8
# python package
import numpy as np
import os
import json
import cPickle as pickle
import pandas as pd
from scipy.optimize import minimize
from geopy.distance import vincenty
# sacred
from sacred import Experiment
# from sacred.observers import MongoObserver
from ...utils import distance

ex_alg_rangebase = Experiment('ALG_RangeBase_expt')

def cost(x, row, beta, P0, GPS):
    v = 0
    for i in range(7):
        if i == 0:
            xi = (row['longitude'], row['latitude'])
            pi = row['All-RxLev Sub (dBm)']
        else:
            xi = (row['longitude_%d'%i], row['latitude_%d'%i])
            pi = row['All-Neighbor RxLev (dBm) (Sorted)[%d]'%i]
        if pi != 0 and xi[0] != -999 and pi != -999:
            v = v + (pi- P0 + 10*beta*np.log10(vincenty(x,xi).meters))**2
    return v

def predict(data, eng_para):
    data = data.fillna(-999)
    data = pd.merge(left=data, right=eng_para, left_on=['All-LAC', 'All-Cell Id'], right_on=['LAC', 'CI'])
    for i in range(1, 7):
        data = pd.merge(left=data, right=eng_para, left_on=['All-Neighbor LAC (Sorted)[%d]'%i, 'All-Neighbor Cell Id (Sorted)[%d]'%i], right_on=['LAC','CI'], suffixes=['', '_%d'%i], how='left')
    data = data.fillna(-999)
    beta, P0 = 3, 0
    pred = []
    for idx, row in data.iterrows():
        gps = (row['All-Longitude'], row['All-Latitude'])
        res = minimize(cost, gps, \
                       method='nelder-mead', \
                       options={'disp':False}, \
                       args=(row, beta, P0, gps))
        pred.append(res.x)
    return pred

def run(testPath, config, outPath):
    eng_para = pd.read_csv('data/2g_gongcan_new.csv')
    eng_para = eng_para[['LAC', 'CI', 'longitude', 'latitude']]
    # get test data
    te_data = pd.read_csv(testPath)
    te_label = te_data[['All-Longitude', 'All-Latitude']].values
    te_pred = predict(te_data, eng_para)

    error = [distance(pt1, pt2) for pt1, pt2 in zip(te_pred, te_label)]
    error = sorted(error)

    # dump error
    f_err = outPath + 'tot_error'
    with open(f_err, 'wb') as f:
        pickle.dump(error, f)

    # save result
    result ={
        'outPath':outPath,
        'TestSize':len(error),
        'MaxError':np.max(error),
        'MinError':np.min(error),
        'MeanError':np.mean(error),
        'MedianError':np.median(error),
        'Per67Error':error[int(len(error) * 0.67)],
        'Per80Error':error[int(len(error) * 0.8)],
        'Per90Error':error[int(len(error) * 0.9)]
    }
    return result

@ex_alg_rangebase.main
def start(criteria):
    id = criteria["id"]
    configuration = criteria["configuration"]
    # trainSet = criteria["trainSet"]
    testSet = criteria["testSet"]
    # trainPath = 'data/train/' + trainSet
    testPath = 'data/test/'+ testSet
    files = os.listdir('data/results/'+id+'/')
    outPath = 'data/results/'+id+'/'+str(len(files))+'/'
    os.mkdir(outPath)

    res = run(testPath, configuration, outPath)
    # res['trainSet'] = trainSet
    res['testSet'] = testSet
    res['id'] = id
    res['algResNumber'] = len(files)
    f_res = open(outPath + 'result.txt', 'w')
    f_res.write(json.dumps(res))
    return res
