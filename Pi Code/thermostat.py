from hotqueue import HotQueue
import paho.mqtt.client as mqtt
from datetime import datetime
import RPi.GPIO as GPIO
import json
import time

HVAC = "ON"

HVAC_STANDBY = 5
HVAC_RUN = 6

GPIO.cleanup()
GPIO.setmode(GPIO.BCM)
GPIO.setup(HVAC_STANDBY,GPIO.OUT)
GPIO.setup(HVAC_RUN,GPIO.OUT)

queue = HotQueue("sensordata", host="localhost", port=6379, db=0)
queue.clear()

def on_connect(mosq, obj, rc):
    mqttc.subscribe([("HVAC_STATUS", 0)])
    print("rc: " + str(rc))

def on_message(mosq, obj, msg):
	
	global HVAC
	print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
	if msg.topic == 'HVAC_STATUS':
		HVAC = str(msg.payload)

def on_subscribe(mosq, obj, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_log(mosq, obj, level, string):
    print(string)

# Data Json Object
temperatureData = {}
humidityData = {}

mqttc = mqtt.Client()
# Assign event callbacks
mqttc.on_message = on_message
mqttc.on_connect = on_connect
mqttc.on_subscribe = on_subscribe
# Connect on Mosquitto
mqttc.connect("52.33.59.166", 1883,60)
# Continue the network loop
mqttc.loop_start()
print "Started"

while True:
	
	if HVAC== "ON":
		GPIO.output(HVAC_RUN, GPIO.HIGH)
		GPIO.output(HVAC_STANDBY, GPIO.LOW)
	else:
		GPIO.output(HVAC_RUN, GPIO.LOW)
		GPIO.output(HVAC_STANDBY, GPIO.HIGH)

	for item in queue.consume():
		print item
                if item[0:1] == "4" and HVAC == "OFF":
                    continue
                if item[1:2] == "1":
                    temperatureData['teamId'] = item[0:1]
                    temperatureData['type'] = "temperature"
                    temperatureData['tval'] = int(item[2:4])
                    temperatureData['time'] = str(datetime.now())
                    tempJsonData = json.dumps(temperatureData)
                    mqttc.publish("TemperatureRT", tempJsonData)

                if item[1:2] == "2":
                    humidityData['teamId'] = item[0:1]
                    humidityData['type'] = "humidity"
                    humidityData['hval'] = int(item[2:4])
                    humidityData['time'] = str(datetime.now())
                    humJsonData = json.dumps(humidityData)
                    mqttc.publish("HumidityRT", humJsonData)
