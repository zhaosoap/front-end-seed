from localization.preprocess import clean
from localization.algorithms import RF_roc
import pandas as pd
import numpy as np
import sys
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

@app.route('/')
def indexPage():
    return app.send_static_file('index.html')

@app.route('/api/data/raw',methods = ['GET'])
def getRawData():
    sample = ["xx.csv","xxx.csv"]
    return json.dumps(sample)

@app.route('/api/run/clean',methods = ['POST'])
def runClean():
    clean.run("forward.csv", None)   
    return clean.run("backward.csv", None)

@app.route('/api/run/algorithms',methods = ['POST'])
def runAlgorithm():
    RF_roc.run(1,2,3)
    return "success"

@app.route('/api/run/results/<algName>',methods = ['GET'])
def getResults(algName):
    df = pd.read_csv('data/results/outDF.csv')
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
