
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

DEBUG = True

app = Flask(__name__, static_url_path='',static_folder='data')
CORS(app)
app.config.from_object(__name__)

@app.route('/api/testPOST',methods = ['POST'])
def testPOST():
    reqJson = json.loads(request.data)
    output = reqJson['test'] + '_POST_processed'
    
    res = {
        'message': 'success',
        'result': output
    }
    return json.dumps(res)


@app.route('/api/testGET',methods = ['GET'])
def testGET():

    reqJson = request.args
    output= reqJson['test']  + '_GET_processed'

    res = {
        "message": "success",
        "result": output
    }
    return json.dumps(res)




if __name__ == '__main__':
    app.run(host='0.0.0.0')
