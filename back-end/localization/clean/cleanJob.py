import os
import pandas as pd

def is_clean_job_done(criteria, filePath):
	inFile = open(filePath)

	for line in inFile:
		items = line.split(',')

		if (str(criteria[0]) == items[0] and
			str(criteria[1]) == items[1] and
			str(criteria[2]) == items[2] and
			str(criteria[3]) == items[3] and
			str(criteria[4]) == items[4]):
			return [x.strip() for x in items[5:]]

	return False

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


	return inputRows, inputColumns, outputRows, outputColumns


def write_to_clean_job_file(criteria, outputDetail):
	tot_list = criteria + outputDetail

	tot_str = ','.join(str(x) for x in tot_list)

	outputFile = open('done-job-index/CleanDoneList.csv','a')

	outputFile.write(tot_str + '\n')


def cleanByCriteria(reqJson):
    inputFileName = reqJson["rawFile"]
    delNullLacOrCellId = reqJson["delNullLacOrCellId"]
    delNullLngOrLat = reqJson["delNullLngOrLat"]
    isMR = reqJson["isMR"]
    RxLevGreaterThan = reqJson["RxLevGreaterThan"]

    jobDoneFilePath = 'done-job-index/CleanDoneList.csv'

    criteria = [inputFileName, delNullLacOrCellId, delNullLngOrLat, isMR, RxLevGreaterThan]

    isCleanJobDone = is_clean_job_done(criteria, jobDoneFilePath)

    if (isCleanJobDone):
        inputRows = isCleanJobDone[0]
        inputColumns = isCleanJobDone[1]
        outputRows = isCleanJobDone[2]
        outputColumns = isCleanJobDone[3]
        cleanFileName = isCleanJobDone[4]
    else:
	    inputFilePath = 'data/raw/' + inputFileName
	    cleanFileName = get_clean_file_name(criteria, 'data/raw/')
	    inputRows, inputColumns, outputRows, outputColumns = do_clean_file(inputFilePath, cleanFileName, criteria)
	    outputDetail = [inputRows, inputColumns, outputRows, outputColumns, cleanFileName]
	    write_to_clean_job_file(criteria, outputDetail)



    result = {
        "message": "Clean task has been completed.",
        "input": {
            "rawFile": inputFileName,
            "rows": int(inputRows),
            "columns": int(inputColumns)
        },
        "output": {
            "cleanFile": cleanFileName,
            "rows": int(outputRows),
            "columns": int(outputColumns)
        }
    }

    return result



