# Implementing the Nest Thermostat

- THSense is a learning thermostat which collects the Temperature and Humidity Sensing data from Arduino and sends it via RF to the Gateway (Raspberry Pi). 
- We further perform Data Analytics on the real-time data collected in the Cloud using the ELK Stack. 
- Also, one can control and monitor the registered thermostats (devices) remotely via the web application.

Technology Stack
 
*- Hardware
	Arduino Uno
	Raspberry Pi
	RF Transmitter and Receiver
	DHT Sensor
	Heating Pad
	LCD Display

*- Software/Cloud
	Redis
	Mosquitto Broker
	Apache Kafka
	ELK Stack
	Apache Spark
	Web App using AngularJS
 

** Arduino – Thermostat Device:
1. The DHT11 sensor is used to collect the temperature and humidity data. It has a LCD display to show the current temperature and humidity.
2. Transmitter module is used to transmit the data via RF to the Gateway (Raspberry Pi). Transmitter should send data (5 times) only if there is any change in the current humidity or temperature.

** Raspberry Pi - Gateway:
1. The gateway (Raspberry Pi) has a RF Receiver module which will receive the data from the thermostat devices and continuously put it into a Redis queue. It should omit repeated messages if same message is received more than once by maintaining a cache of previous 15 data.
2. The Paho MQTT client will publish the data to the relevant topic whenever the data is available, to the MQTT broker on the cloud.

** Cloud:
1. MQTT broker will get the data and publish to the Kafka Publisher.
2. We have used Kafka to scale the MQTT Broker. The design is flexible to connect any number of MQTT brokers to Kafka.
3. An MQTT bridge is required to publish the data from MQTT broker to Kafka. A bridge is a small program which will subscribe to topics by MQTT broker, extract the data and publish to Kafka.
4. Input, Output and Filters to Elastic search is defined in Logstash. It will limit the data which is going into ES.

** Web App:
1. It has Google OAuth Authentication for login and sign up purposes.
2. It shows the dashboard with all the registered devices for the user and analytics for those devices.
3. The web app gives device control features and also shows the predicted inside temperature for the next 5 hours based on the ML algorithm using Spark.
4. We have used Angular JS to build the web app and Serve (a Directory Server) to host the application.

-- See the Project1_Group4_Report.pdf for Circuit Connections, Setup and how to execute the code and screenshots of the web app.

*** Server IP & Ports

Following are the services deployed for the assignment -

1. Mosquitto Broker -
	- IP – 52.33.59.166 (AWS Instance Elastic IP)
	- Port – 1883
	- Websockets – 9001, 9002
	- Listeners - 52.33.59.166:1883 and Websocket - 52.33.59.166:9001
2. Kafka -
	- Server IP: 52.33.59.166:9092
	- Zookeeper IP: 52.33.59.166:2181
3. Elasticsearch -
	- IP: 52.33.59.166:9200
4. Logstash -
	- IP: 52.33.59.166:9300
5. Kibana -
	- IP: 52.33.59.166:5601
6. WebApp -
	- IP: 52.33.59.166:3000
7. Spark - 
	- IP: 50.18.94.136:9999


