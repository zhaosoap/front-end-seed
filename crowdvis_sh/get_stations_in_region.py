import json,sys,pprint,time

class WrongUsageException(Exception):
    pass

class WrongValueException(Exception):
	pass

def getStationGpsMapping(filename):
	rf = open(filename,'r')
	jsonObj = json.load(rf)
	rf.close()
	return jsonObj

def checkInRegion(pt, tl, br):
	if pt[0]<tl[0] or pt[0]>br[0]:
		return False
	elif pt[1]<tl[1] or pt[1]>br[1]:
		return False
	else:
		return True

def extractStationList(filepath, _tlPoint, _brPoint):
	#startTime = time.time()
	id2GpsFilePath = filepath
	tlPoint = _tlPoint
	brPoint = _brPoint
	
	sidInRegion = []
	IdGpsList = getStationGpsMapping(id2GpsFilePath)
	
	for eachS in IdGpsList:
		gps = eachS['position']
		if checkInRegion(gps,tlPoint,brPoint):
			sidInRegion.append(eachS['id'])
	
	return sidInRegion
	
	
if __name__ == '__main__':
	
	#startTime = time.time()
	if len(sys.argv)!=5:
		raise WrongUsageException("Usage: python get_stations_in_region Lat_1 Lng_1 Lat_2 Lng_2")
	
	id2GpsFilePath = 'db/data/id2Gps.json'
	startLat = float(sys.argv[1])
	startLng = float(sys.argv[2]) 
	endLat = float(sys.argv[3])
	endLng = float(sys.argv[4])
	
	if startLat>endLat or startLng>endLng:
		raise WrongValueException("The First Point Must Be Top-Left Corner")
	
	tlPoint = [startLat,startLng]
	brPoint = [endLat,endLng]
	
	sidInRegion = []
	IdGpsList = getStationGpsMapping(id2GpsFilePath)
	
	for eachS in IdGpsList:
		gps = eachS['position']
		if checkInRegion(gps,tlPoint,brPoint):
			sidInRegion.append(eachS['id'])
	
	pp = pprint.PrettyPrinter()
	pp.pprint(sidInRegion)
	
	print "Finish Execution"
	#print ('--- %s seconds ---' % (time.time() - startTime))
	