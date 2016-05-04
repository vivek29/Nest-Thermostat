from pyspark.mllib.regression import LabeledPoint, LinearRegressionWithSGD, LinearRegressionModel
from pyspark import SparkContext
import datetime, time
import numpy as np
import pyowm
import os
import urllib2
import json

def prediction(hour,extern_temp):	
	if hour>=0 and hour<6:
		
		#Predict Temperature
		tempModel1 = LinearRegressionModel.load(sc, "/home/dhruv/Desktop/IoT/Assignment-3/Final/model1")
		x = np.array([extern_temp])
		temp_data = tempModel1.predict(x)
		print temp_data

	elif hour>=6 and hour<12:
		
		#Predict Temperature
		tempModel2 = LinearRegressionModel.load(sc, "/home/dhruv/Desktop/IoT/Assignment-3/Final/model2")
		x = np.array([extern_temp])
		temp_data = tempModel2.predict(x)
		print temp_data

	elif hour>=12 and hour<18:

		#Predict Temperature
		tempModel3 = LinearRegressionModel.load(sc, "/home/dhruv/Desktop/IoT/Assignment-3/Final/model3")
		x = np.array([extern_temp])
		temp_data = tempModel3.predict(x)
		print temp_data
		
	elif hour>=18 and hour<24:

		#Predict Temperature
		tempModel4 = LinearRegressionModel.load(sc, "/home/dhruv/Desktop/IoT/Assignment-3/Final/model4")
		x = np.array([extern_temp])
		temp_data = tempModel4.predict(x)
		print temp_data
	f.write('%.2f' % temp_data)
	f.write('\n')

f = open('myfile.txt','w')
sc = SparkContext("local", "temperature_prediction")
owm = pyowm.OWM('84cbd5a5609b59fbecab071e669febd5')
fc1=owm.three_hours_forecast("San Jose,us")
f1 = fc1.get_forecast()
extern_temp = []
extern_humidity = 0

input = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

foo = urllib2.urlopen('http://api.wunderground.com/api/9eca61dba716f08d/hourly/q/CA/San_Jose.json')
json_string = foo.read()
parsed_json = json.loads(json_string)
temp = [1,1,1,1,1]

temp[0] = parsed_json['hourly_forecast'][0]['temp']['metric']
temp[1] = parsed_json['hourly_forecast'][1]['temp']['metric']
temp[2] = parsed_json['hourly_forecast'][2]['temp']['metric']
temp[3] = parsed_json['hourly_forecast'][3]['temp']['metric']
temp[4] = parsed_json['hourly_forecast'][4]['temp']['metric']

hour = int(input[11:13])
print hour

for x in xrange(1,6):
	prediction(hour+x,temp[x-1])

foo.close()
f.close()
sc.stop()