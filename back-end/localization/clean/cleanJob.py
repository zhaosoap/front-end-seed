import os
import pandas as pd
from sacred import Experiment
from sacred.observers import MongoObserver
import pymongo

ex_clean = Experiment('clean_expt')

@ex_clean.config
def my_config():
    pass


def get_clean_file_name(criteria, rawPath):
	files = os.listdir(rawPath)
	num = files.index(criteria[0])

	c1 = 'f'
	c2 = 'f'
	mr = 'all'
	if (criteria[1] == True):
		c1 = 't'
	if (criteria[2] == True):
		c2 = 't'
	if (criteria[3] == True):
		mr = 'mr'

	cleanFileName = str(num) + '_' + c1 + '_' + c2 + '_' + mr + '_' + str(criteria[4]) + '.csv'

	return cleanFileName


def do_clean_file(rawFilePath, cleanFileName, criteria):
	df = pd.read_csv(rawFilePath)
	inputRows = df.shape[0]
	inputColumns = df.shape[1]

	needToDelCol = []

	if (criteria[1] == True):
		needToDelCol = ['All-LAC','All-Cell Id']
	if (criteria[2] == True):
		needToDelCol.extend(['All-Longitude','All-Latitude'])

	if (len(needToDelCol)):
		for colName in needToDelCol:
			df = df[df[colName].notnull()]
	df = df.fillna(-999)
	df = df[df['All-RxLev Sub (dBm)'] > int(criteria[4])]

	if (criteria[3] == True):
		df = df[df['Message Type'] == 'Measurement Report']

	outputRows = df.shape[0]
	outputColumns = df.shape[1]

	df.to_csv('data/clean/' + cleanFileName, index = False)


	return inputRows, inputColumns, outputRows, outputColumns, cleanFileName


@ex_clean.main
def cleanByCriteria(criteria):
    rawFile = criteria['rawFile']
    delNullLacOrCellId = criteria['delNullLacOrCellId']
    delNullLngOrLat = criteria['delNullLngOrLat']
    isMR = criteria['isMR']
    RxLevGreaterThan = criteria['RxLevGreaterThan']


    criteria = [rawFile, delNullLacOrCellId, delNullLngOrLat, isMR, RxLevGreaterThan]

    inputFilePath = 'data/raw/' + rawFile
    cleanFileName = get_clean_file_name(criteria, 'data/raw/')
    inputRows, inputColumns, outputRows, outputColumns, cleanFileName = do_clean_file(inputFilePath, cleanFileName, criteria)

    result = {
        'inputRows': inputRows,
        'inputColumns': inputColumns,
        'outputRows': outputRows,
        'outputColumns': outputColumns,
        'cleanFile': str(cleanFileName),
        'rawFile': str(rawFile)
    }

    return result
