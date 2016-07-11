import urllib2
import sys
import re
import json
import os

def write_batch(buffer_list, buffer_lon, buffer_lat, f_correct_route):
	base_url = 'http://api.zdoz.net/transmore.ashx?'
	url = base_url \
	   + 'lats=' + ';'.join(buffer_lat) + '&' \
	   + 'lngs=' + ';'.join(buffer_lon) + '&' \
	   + 'type=1'
	req = urllib2.Request(url)
	response = urllib2.urlopen(req)
	res = response.read()
	# print url
	# print res
	res = res[res.find('[')+1:res.find(']')]
	res = res.split('},')
	for i in xrange(len(buffer_list)):
		lonlat = []
		try:
			if i == len(res)-1:
				lonlat.append(json.loads(res[i]))
			else:
				lonlat.append(json.loads(res[i]+'}'))
		except:
			print i,len(res)
			print buffer_list[i]

		buffered_line = buffer_list[i]
		buffered_line[11] = str(lonlat[0]['Lng'])
		buffered_line[12] = str(lonlat[0]['Lat'])
		line = ','.join(buffered_line)
		f_correct_route.write(line+'\n')


		# f_correct_route.write(buffered_line[0]+','+buffered_line[1]+','+buffered_line[2]+','+buffered_line[3]+','+\
		#    str(lonlat['Lat'])+'N,'+str(lonlat['Lng'])+'E,'+buffered_line[6]+','+buffered_line[7]+','+buffered_line[8]+','+buffered_line[9]+'\n')

def correct_route(dir, f, files):
	# print filename
	add_prefix = re.compile('\.csv')
	if f.find('.csv') == -1:
		return
	if f in files or f.find('corrected') > 0:
	    return
	print f
	f_raw_route = open(dir+'/'+f)
	outpath = dir+'/corrected/'+ f
	f_correct_route = open(outpath, 'w')

	base_url = 'http://api.zdoz.net/transmore.ashx?'
	data = {}

	head_string = f_raw_route.readline()
	f_correct_route.write(head_string)

	buffer_list = []
	buffer_lat = []
	buffer_lon = []
	for line in f_raw_route:
		line = line.strip().split(',')
		for tl in [11,12]:
			if line[tl] == '':
				line[tl] = '0'
		if len(buffer_list) == 50:
			write_batch(buffer_list, buffer_lon, buffer_lat, f_correct_route)

			buffer_list = []
			buffer_lon = []
			buffer_lat = []

		buffer_list.append(line)
		buffer_lon.append(line[11].strip())
		buffer_lat.append(line[12].strip())


	write_batch(buffer_list, buffer_lon, buffer_lat, f_correct_route)


	f_raw_route.close()
	f_correct_route.close()
	print outpath
	# os._exit(0)

if __name__ == '__main__':

	#filename = sys.argv[1]
	#dirname = '/Users/zhufangzhou/Desktop/[C] Windows 7 x64/Users/ZhuFangzhou/Desktop/20151218/traj'
	dirs = ['train','test']
#	dirname = '/Users/zhufangzhou/Desktop/2015Unicom/data'

	#correct_route(dirname + '/traj.csv')
	for dir in dirs:
		files = os.listdir(dir)
		for f in files:
			correct_route(dir, f, os.listdir(dir+'/corrected'))
