import get_stations_in_region
import json,sys,pprint,time
import mysql
import multiprocessing
from mysql.connector import errorcode

class WrongUsageException(Exception):
    pass

class WrongValueException(Exception):
    pass

def hourToTableName(hour):
    if hour<10:
        tableName = 'hour0%d'%hour
    else:
        tableName = 'hour%d'%hour
    return tableName
    
def printTime(task, currTime):
    newTime = time.time()
    print ('--- %s seconds for %s---' % ((newTime - currTime),task))
    return newTime

def sqlGetUserList(sqlConnect, sList, tablename, slice):
    sqlCursor = sqlConnect.cursor()
    format_strings = ','.join(['%s'] * len(sList))
    print len(sList)
    queryText = "SELECT uid FROM %s WHERE sid IN (%s) AND tid = %s" % (tablename, format_strings, slice)
    sqlCursor.execute(queryText,tuple(sList))
    userList = []
    for (uid) in sqlCursor:
        userList.append(int(uid[0]))
    
    sqlCursor.close()
    return userList

def genAggrStayParallel(uList, start_hour, end_hour, hour, gpsDict):
    print "Start Parallel Execution"
    # In parallel
    pool = multiprocessing.Pool()
    for hour_i in xrange(start_hour,end_hour):
        pool.apply_async(genAggrStay, args=(uList, start_hour, hour_i, gpsDict),callback = asyncCallBack)
    
    pool.close()
    pool.join()

def genAggrStay(uList, start_hour, hour, gpsDict):
    print "Start Data Retrival in Parallel - hour%d" % hour 
    rDict = {}
    fDict = {}
    # Connect to MySQL
    try:
      sqlConnect = mysql.connector.connect(user='root',host='127.0.0.1',database='stay20131016')
    except mysql.connector.Error as err:
      if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Something is wrong with your user name or password")
      elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
      else:
        print(err)
    
    startSlice = (hour-start_hour)*12
    tablename = hourToTableName(hour)
    print "Querying in table %s" % tablename
    
    sqlCursor = sqlConnect.cursor()
    format_strings = ','.join(['%s'] * len(uList))
    queryText = "SELECT sid, tid FROM %s WHERE uid IN (%s)" % (tablename, format_strings)
    sqlCursor.execute(queryText,tuple(uList))
    
    for record in sqlCursor:
        sid = int(record[0])
        tid = int(record[1])
        slice_id = str(tid+startSlice)
        if not rDict.has_key(slice_id):
            rDict[slice_id] = {}
        if rDict[slice_id].has_key(sid):
            rDict[slice_id][sid] += 1
        else:
            rDict[slice_id][sid] = 1
    print "Done retracting %s" % tablename
    
    sqlCursor.close()
    sqlConnect.close()
    
    #format data
    formatAggrStay(rDict,gpsDict,fDict)
    return fDict

def formatAggrStay(rDict,gpsDict,fDict):
    for (slice, stationDict) in rDict.items():
        fDict[slice] = []
        for (sid, pop) in stationDict.items():
            try:
                pos = gpsDict[str(sid)]
            except:
                continue
            stayItem = {}
            stayItem['id'] = sid
            stayItem['pop'] = pop
            stayItem['position'] = {'latitude':pos[1],'longitude':pos[0]}
            fDict[slice].append(stayItem)

formatDict = {}
def asyncCallBack(result):
    formatDict.update(result)

def runMain(startLat, startLng, endLat, endLng, hour, slice, startHour, endHour):
    id2GpsFilePath = 'db/data/id2Gps.json'
    sList = get_stations_in_region.extractStationList(id2GpsFilePath,[startLng,startLat],[endLng,endLat])
    
    # Connect to MySQL
    try:
        mysqlConnect = mysql.connector.connect(user='root',host='127.0.0.1',database='stay20131016')
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
        
    uList = sqlGetUserList(mysqlConnect, sList, hourToTableName(hour), slice)
    mysqlConnect.close()
    
    # Load station - gps mapping
    with open('db/data/id2Gps_new.json','r') as rf:
        gpsDict = json.load(rf)
        rf.close()
    
    genAggrStayParallel(uList, startHour, endHour, hour, gpsDict)
    
    return formatDict

if __name__ == '__main__':
    currTime = time.time()
    hour = 8
    slice = 0
    startLat = 113.288
    startLng = 23.382
    endLat = 113.308
    endLng = 23.402
     
    id2GpsFilePath = '../data/id2Gps.json'
    sList = get_stations_in_region.extractStationList(id2GpsFilePath,[startLat,startLng],[endLat,endLng])
    currTime = printTime('Station List Extraction',currTime)
    
    # Connect to MySQL
    try:
        mysqlConnect = mysql.connector.connect(user='root',host='127.0.0.1',database='stay20131016')
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Something is wrong with your user name or password")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist")
        else:
            print(err)
        
    uList = sqlGetUserList(mysqlConnect, sList, hourToTableName(hour), slice)
    currTime = printTime('User List Extraction',currTime)
    mysqlConnect.close()
    
    # Start extracting records
    startHour = 6
    endHour = 15
    
    # Load station - gps mapping
    with open('../data/id2Gps_new.json','r') as rf:
        gpsDict = json.load(rf)
        rf.close()
    
    genAggrStayParallel(uList, startHour, endHour, hour, gpsDict)
    currTime = printTime('Stay Record Generation in Parallel',currTime)
    
    with open('tmp.json','w') as wf:
        json.dump(formatDict,wf,indent=2,separators=(',',':'))
        wf.close()
    