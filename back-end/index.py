from localization.preprocess import clean
from localization.algorithms.RF_roc import RF_roc
import pandas as pd
import numpy as np
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
REGION_FOLDER_LIST = ['pudong_airport/','hongqiao_airport/','fudan_univ/','xujiahui/']
MOVEMENT_FILENAME = 'movement_7_12.json'

app = Flask(__name__, static_url_path='')
CORS(app)
app.config.from_object(__name__)

@app.route('/api/run/clean',methods = ['POST'])
def runClean():
    reqJson = json.loads(request.data)
    #{
    #  "rawFile": "forward.csv"
    #  "delNullLacOrCellId" : true,
    #  "delNullLngOrLat" : true,
    #  "MessageType" : "Measurement Report",
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
    clean.run("forward.csv", None)
    clean.run("backward.csv", None)
    return null

@app.route('/api/run/split',methods = ['POST'])
def runSplit():
    reqJson = json.loads(request.data)
    #{
    #  "cleanFile": "forward_t_t_mr_-60.csv"
    #  "ordered" : true,
    #  "random" : false,
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
    return null

@app.route('/api/run/algorithm',methods = ['POST'])
def runAlgorithm():
    reqJson = json.loads(request.data)
    print reqJson
    algorithms = {
        "RF_roc" : RF_roc
    }
    id = reqJson["id"]
    configuration = reqJson["configuration"]
    trainSet = reqJson["trainSet"]
    testSet = reqJson["testSet"]
    files = os.listdir('data/results/'+id+'/')
    # print files
    outPath = 'data/results/'+id+'/'+str(len(files))+'/'
    os.mkdir(outPath)
    # print outPath
    algorithms[id].run(trainSet,testSet,configuration,outPath)
    # run this algorithm
    return "success"

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


@app.route('/api/data/results/<algName>/<resultId>',methods = ['GET'])
def getResults(algName, resultId):
    df = pd.read_csv('data/results/'+algName+'/'+resultId+'/outDF.csv')
    return df.to_json(orient="values")

@app.route('/movement/get_stay_data',methods = ['POST'])
def getStayData():
    filename = 'stay_9.json'
    filepath = 'static/data/density/sample/'+filename
    with open(filepath) as data_file:
        data = json.load(data_file)
    return json.dumps(data)


@app.route('/movement/get_movement_data',methods = ['POST'])
def getMovementData():
    #data: hour,slice,startHour,endHour,startLat,startLng,endLat,endLng
    params = json.loads(request.data)
    fileid = int(params['regionId'])

    filepath = 'static/data/movement/'+REGION_FOLDER_LIST[fileid]+MOVEMENT_FILENAME
    with open(filepath) as data_file:
        data = json.load(data_file)
    return json.dumps(data)



if __name__ == '__main__':
    app.run(host='0.0.0.0')
