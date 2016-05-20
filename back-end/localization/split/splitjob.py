import os
import pandas as pd
from sacred import Experiment
from sacred.observers import MongoObserver
import pymongo
from sklearn import cross_validation

ex_split = Experiment('split_expt')

ex_split.observers.append(MongoObserver.create(url='115.28.215.182:27017',
                                        db_name='jobdone'))

@ex_split.config
def my_config():
    pass


def get_clean_file_name(criteria, cleanPath):
	files = os.listdir(cleanPath)
	num = files.index(criteria[0])

	c1 = 'f'
	ratio = criteria[2]
	if (criteria[1] == True):
		c1 = 't'

	trainFileName = 'train_' + num + '_' + c1 + '_' + str(ratio) + '.csv'
	testFileName = 'test_' + num + '_' + c1 + '_' + str(ratio) + '.csv'

	return trainFileName, testFileName


def run_split(cleanFilePath, trainFileName, testFileName, criteria):
	df = pd.read_csv(cleanFilePath)
	cleanFileRows = df.shape[0]
	cleanFileColumns = df.shape[1]

	isRandom = criteria[1]
	ratio = criteria[2] / 100.0
	
	if not isRandom:
		splitPoint = int(cleanFileRows * ratio)

		train_df = df.iloc[:splitPoint, :]
		train_df.to_csv('data/train/' + trainFileName, index = False)

		test_df = df.iloc[splitPoint:, :]
		test_df.to_csv('data/test/' + testFileName, index = False)

	else:

		rs = cross_validation.ShuffleSplit(cleanFileRows, n_iter = 1, test_size = ratio)
		for train_index, test_index in rs:
			train_index.sort()
			test_index.sort()
			train_df = df.iloc[[train_index],:]
			train_df.to_csv('data/train/' + trainFileName, index = False)

			test_df = df.iloc[[test_index],:]
			test_df.to_csv('data/test/' + testFileName, index = False)

	trainRows = train_df.shape[0]
	trainColumns = train_df.shape[1]
	testRows = test_df.shape[0]
	testColumns = test_df.shape[1]

	cleanFile = {
		''
	}

	return trainRows, trainColumns, testRows, testColumns, cleanFileRows, cleanFileColumns



@ex_split.main
def do_split(criteria):
	cleanFile = criteria['cleanFile']
	isRandom = criteria['isRandom']
	ratio = criteria['ratio']

	criteria = [cleanFile, isRandom, ratio]

	cleanFilePath = 'tata/clean/' + cleanFile

	trainFileName, testFileName = get_split_file_name(criteria, 'data/clean')

	trainRows, trainColumns, testRows, testColumns, cleanFIleRows, cleanFileColumns = run_split(cleanFilePath, trainFileName, testFileName, criteria)

	result = {
		"message" : "Split task has been completed.",
		'input': {
			'cleanFile': cleanFile,
			'rows': cleanFileRows,
			'columns': cleanFileColumns
		},
		'train': {
			'trainSet': trainFileName,
			'rows': trainRows,
			'columns': trainColumns
		},
		'test': {
			'testSet': testFileName,
			'rows': testRows,
			'columns': testColumns
		}
	}

	return result