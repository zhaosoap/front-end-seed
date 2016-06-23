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
	lonlat = []
	for i in xrange(len(buffer_list)):
		for j in xrange(3):
			k = i*3+j;
			try:
				if k == len(res)-1:
					lonlat.append(json.loads(res[k]))
				else:
					lonlat.append(json.loads(res[k]+'}'))
			except:
				print k,len(res)
				print i,j		

		buffered_line = buffer_list[i]	
		f_correct_route.write(\
			str(lonlat[0]['Lng'])+','+str(lonlat[0]['Lat'])+','+\
			str(lonlat[1]['Lng'])+','+str(lonlat[1]['Lat'])+'\n')

		# f_correct_route.write(buffered_line[0]+','+buffered_line[1]+','+buffered_line[2]+','+buffered_line[3]+','+\
		#    str(lonlat['Lat'])+'N,'+str(lonlat['Lng'])+'E,'+buffered_line[6]+','+buffered_line[7]+','+buffered_line[8]+','+buffered_line[9]+'\n')

def correct_route(filename, f, files):
	add_prefix = re.compile('\.csv')
	if f.find('.csv') == 0:
		return
	if add_prefix.sub('_corrected.csv', f) in files or f.find('corrected') > 0:
	    return
	# print f
	f_raw_route = open(filename)
	f_correct_route = open(add_prefix.sub('_corrected.csv', filename), 'w')

	base_url = 'http://api.zdoz.net/transmore.ashx?'
	data = {}

	head_string = f_raw_route.readline()
	f_correct_route.write(head_string)

	buffer_list = []
	buffer_lat = []
	buffer_lon = []
	for line in f_raw_route:
		line = line.strip().split(',') 
		line = ['0' if s=='' else s  for s in line]	

		if len(buffer_list) == 20:
			#url = base_url \
			   #+ 'lats=' + ';'.join(buffer_lat) + '&' \
			   #+ 'lngs=' + ';'.join(buffer_lon) + '&' \
			   #+ 'type=1'
			#req = urllib2.Request(url)
			#response = urllib2.urlopen(req)
			#res = response.read()
			#print res
			#res = res[res.find('[')+1:res.find(']')]
			#res = res.split(',')
			#for i in xrange(len(res)):
				#lonlat = json.loads(res[i])
				#buffered_line = buffer_list[i]	
				#f_correct_route.write(buffered_line[0]+','+buffered_line[1]+','+buffered_line[2]+','+buffered_line[3]+','+\
				   #str(lonlat['Lat'])+'N,'+str(lonlat['Lng'])+'E,'+buffered_line[6]+','+buffered_line[7]+','+buffered_line[8]+','+buffered_line[9]+'\n')
			write_batch(buffer_list, buffer_lon, buffer_lat, f_correct_route)
				
			buffer_list = []
			buffer_lon = []
			buffer_lat = []

		buffer_list.append(line)	
		buffer_lon.append(line[0].strip())
		buffer_lat.append(line[1].strip())
		buffer_lon.append(line[2].strip())
		buffer_lat.append(line[3].strip())



	write_batch(buffer_list, buffer_lon, buffer_lat, f_correct_route)


	f_raw_route.close()
	f_correct_route.close()
	print filename
	# os._exit(0)

if __name__ == '__main__':

	#filename = sys.argv[1]
	#dirname = '/Users/zhufangzhou/Desktop/[C] Windows 7 x64/Users/ZhuFangzhou/Desktop/20151218/traj'
	dirname = 'results'
#	dirname = '/Users/zhufangzhou/Desktop/2015Unicom/data'
	algs = os.listdir(dirname)
	print algs
	#correct_route(dirname + '/traj.csv')
	for alg in algs:
		if os.path.isdir(dirname+'/'+alg):
			nums = os.listdir(dirname+'/'+alg)
			for num in nums:
				if os.path.isdir(dirname+'/'+alg+'/'+num):
					files = os.listdir(dirname+'/'+alg+'/'+num)
					for f in files:
						correct_route(dirname+'/'+alg+'/'+num + '/' + f, f, files)
						# os._exit(0)



