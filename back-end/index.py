from localization.clean.cleanJob import ex_clean
from localization.split.splitjob import ex_split
from localization.algorithms.RF_roc.alg_RF_roc import ex_alg_RF_roc
from localization.algorithms.DT.alg_DT import ex_alg_DT
from localization.algorithms.MLP_aus.alg_MLP_aus import ex_alg_MLP_aus
from localization.algorithms.CellSense.alg_cellsense import ex_alg_cellsense
from localization.algorithms.RangeBase.alg_rangebase import ex_alg_rangebase
from sacred.observers import MongoObserver
from localization.algorithms.RF_roc import rf_roc_adapter
from localization.algorithms.DT import dt_adapter
from localization.algorithms.CellSense import cellsense_adapter
<<<<<<< HEAD
from localization.algorithms.RangeBase import rangebase_adapter
=======
from localization.algorithms.MLP_aus import mlp_aus_adapter
>>>>>>> 5d658099e5ea0145aafdbf91c2069cb4cdada80a
from localization.utils.figure import ArkPlot
import pandas as pd
import numpy as np
import pymongo,pickle,random
import sys
import os
# all the imports
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, flash, jsonify

from flask.ext.cors import CORS

import json

# configuration
#DATABASE = ''
DEBUG = True
#SECRET_KEY = 'development key'
#USERNAME = 'admin'
#PASSWORD = 'default'

app = Flask(__name__, static_url_path='',static_folder='data')
CORS(app)
app.config.from_object(__name__)

conn = pymongo.MongoClient('115.28.215.182',27017)
db = conn['jobdone']
collection = db.default.runs
mongoObserver = MongoObserver.create(url='115.28.215.182:27017',db_name='jobdone')

ex_clean.observers.append(mongoObserver)
ex_split.observers.append(mongoObserver)
ex_alg_RF_roc.observers.append(mongoObserver)
ex_alg_DT.observers.append(mongoObserver)
ex_alg_cellsense.observers.append(mongoObserver)
ex_alg_MLP_aus.observers.append(mongoObserver)

Algorithms = {
    "RF_roc" : ex_alg_RF_roc,
    "DT": ex_alg_DT,
    "CS": ex_alg_cellsense,
<<<<<<< HEAD
    "RB": ex_alg_rangebase
=======
    "MLP_aus": ex_alg_MLP_aus
>>>>>>> 5d658099e5ea0145aafdbf91c2069cb4cdada80a
}
Adapter ={
    "RF_roc" : rf_roc_adapter,
    "DT" : dt_adapter,
    "CS" : cellsense_adapter,
<<<<<<< HEAD
    "RB" : rangebase_adapter
=======
    "MLP_aus" : mlp_aus_adapter
>>>>>>> 5d658099e5ea0145aafdbf91c2069cb4cdada80a
}

@app.route('/api/preprocessor/cleaning',methods = ['POST'])
def runClean():
    reqJson = json.loads(request.data)
    rawFile = str(reqJson['rawFile'])
    delNullLacOrCellId = bool(reqJson['delNullLacOrCellId'])
    delNullLngOrLat = bool(reqJson['delNullLngOrLat'])
    isMR = bool(reqJson['isMR'])
    RxLevGreaterThan = int(reqJson['RxLevGreaterThan'])



#find duplicated record
    result = collection.find_one({
        'config.criteria.rawFile': rawFile,
        'config.criteria.delNullLacOrCellId': delNullLacOrCellId,
        'config.criteria.delNullLngOrLat': delNullLngOrLat,
        'config.criteria.isMR': isMR,
        'config.criteria.RxLevGreaterThan': RxLevGreaterThan,
        'status': 'COMPLETED',
        'experiment.name': 'clean_expt'
        })

#duplicated record found
    if result:
        res = result['result']

#run experiment
    else:
        ex_clean.add_config({
                'criteria': reqJson
                })

        res = ex_clean.run().result

    result = {
        "message": "Clean task has been completed.",
        "input": {
            "rawFile": rawFile,
            "rows": int(res['inputRows']),
            "columns": int(res['inputColumns'])
        },
        "output": {
            "cleanFile": res['cleanFile'],
            "rows": int(res['outputRows']),
            "columns": int(res['outputColumns'])
        }
    }

    return json.dumps(result)

    #print df_in.columns



    #{
    #  "rawFile": "forward.csv"
    #  "delNullLacOrCellId" : true,
    #  "delNullLngOrLat" : true,
    #  "isMR" : true,
    #  "RxLevGreaterThan": -60
    #}
    #
    #1.job had been done once ("CleanDoneList.index")
    #2.run job
    #3.output file to data/clean/xxx.csv
    #4.append task to CleanDoneList.index
    #
    # result = {
    #   "message" : "Clean task has been completed."
    #   "input" : {
    #       "rawFile": "forward.csv",
    #       "rows": 5000,
    #       "columns": 40
    #   }
    #   "output" : {
    #       "cleanFile": "forward_t_t_mr_-60.csv",
    #       "rows": 4000,
    #       "columns": 40
    #   }
    # }
    #clean.run("forward.csv", None)
    #clean.run("backward.csv", None)

@app.route('/api/preprocessor/split',methods = ['POST'])
def runSplit():
    reqJson = json.loads(request.data)

    cleanFile = str(reqJson['cleanFile'])
    isRandom = bool(reqJson['isRandom'])
    ratio = int(reqJson['ratio'])

#find duplicated record
    result = collection.find_one({
        'config.criteria.cleanFile': cleanFile,
        'config.criteria.isRandom': isRandom,
        'config.criteria.ratio': ratio,
        'status': 'COMPLETED',
        'experiment.name': 'split_expt'
        })

#duplicated record found
    if result:
        res = result['result']

#run experiment
    else:
        ex_split.add_config({
                'criteria': reqJson
                })

        res = ex_split.run().result


    #{
    #  "cleanFile": "forward_t_t_mr_-60.csv"
    #  "isRandom": true
    #  "ratio" : 80
    #}
    #
    #1.job had been done once ("SpiltDoneList.index")
    #2.run job
    #3.output file to data/clean/xxx.csv
    #4.append task to SpiltDoneList.index
    #
    #
    # result = {
    #   "message" : "Split task has been completed."
    #   "input" : {
    #       "cleanFile": "clean002.csv",
    #       "rows": 7000,
    #       "columns": 40
    #   }
    #   "train" : {
    #       "trainSet": "Train002.csv",
    #       "rows": 4000,
    #       "columns": 40
    #   }
    #   "test" : {
    #       "testSet": "Test002.csv",
    #       "rows": 3000,
    #       "columns": 40
    # }
    #
    return json.dumps(res)

@app.route('/api/execution',methods = ['POST'])
def runAlgorithm():
    reqJson = json.loads(request.data)
    id = reqJson["id"]
    reqJson = Adapter[id].formatInput(reqJson)
#find duplicated record
    cond = Adapter[id].getCond(reqJson)
    print cond
    result = collection.find_one(cond)
#duplicated record found
    if result:
        res = result['result']
#run experiment
    else:
        Algorithms[id].add_config({
                'criteria': reqJson
                })
        print reqJson
        res = Algorithms[id].run().result

    return json.dumps(res)


@app.route('/api/data/fileList',methods = ['POST'])
def getFileList():
    fileLists = {}
    reqJson = json.loads(request.data)
    for dir in reqJson['dirs']:
        files = os.listdir('data/'+dir)
        files = [x for x in files if x[0] != '.']
        fileLists[dir]=files
    res = {
        'message': 'success',
        'fileLists': fileLists
    }
    return json.dumps(res)

@app.route('/api/data/defaultConf',methods = ['POST'])
def getDefaultConf():
    defaultConfs = {}
    reqJson = json.loads(request.data)
    for alg in reqJson['algorithms']:
        with open('data/default-conf/'+alg+'.json') as data_json:
            data = json.load(data_json)
        defaultConfs[alg]=data
    res = {
        'message': 'success',
        'defaultConfs': defaultConfs
    }
    return json.dumps(res)
@app.route('/api/data/reports',methods = ['POST'])
def getReports():
    reports = []
    reqJson = json.loads(request.data)
    errors = []
    errlabels = []
    for query in reqJson:
        filepath = 'data/results/'+query['alg']+'/'+str(query['num'])+'/'
        with open(filepath+'result.txt') as res_json:
            reports.append(json.load(res_json))
        with open(filepath+'tot_error', 'rb') as f:
            errors.append(pickle.load(f))
            errlabels.append(query['alg']+'_'+str(query['num']))
    aplt = ArkPlot()
    rd = random.randint(0,10000)
    os.system('rm data/images/cdf_*.png')
    params = {
        'data_batch' : errors,
        'label_batch': errlabels,
        'fname':'data/images/cdf_%s.png' % rd,
        'xlabel' : 'Error (m)',
        # 'title' : 'Filter Train: %dm, Filter Test: %dm' % (tr_limit, te_limit),
        'title' : 'Cumulative distribution function(CDF)',
        'ylabel' : 'Percentage',
    }
    aplt.cdf(**params)

    res = {
        'message': 'success',
        'cdf':'images/cdf_%s.png' % rd,
        'reports': reports
    }
    return json.dumps(res)

@app.route('/api/data/reportList',methods = ['GET'])
def getReportList():
    defaultConfs = {}
    reqJson = request.args
    results = collection.find({
        'config.criteria.testSet': reqJson['testSet'],
        'config.criteria.trainSet': reqJson['trainSet']
        })
    output = {}
    for item in results:
        if not item['result']['id'] in output:
            output[item['result']['id']] = []
        output[item['result']['id']].append(item['result']['algResNumber'])
    res = {
        "message": "success",
        "domTree": output
    }
    return json.dumps(res)

@app.route('/api/data/results/<algName>/<resultId>',methods = ['GET'])
def getResults(algName, resultId):
    fpath = 'data/results/'+algName+'/'+resultId+'/'
    df = pd.read_csv(fpath+'outDF.csv')
    with open(fpath+'result.txt') as restxt:
         resjson= json.load(restxt)
    res = {
        "message": "success",
        "data": json.loads(df.to_json(orient="values")),
        "result": resjson
    }
    print res
    return json.dumps(res)



if __name__ == '__main__':
    app.run(host='0.0.0.0')
