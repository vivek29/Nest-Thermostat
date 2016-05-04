# Implementing the Nest Thermostat

- An IoT application which helps monitor and control the thermostat's using a web app with real time temperature predictions based on the home thermal model.
- THSense is a learning thermostat which collects the temperature and humidity sensing data using an Arduino Uno kit and transmits it to the Gateway (Raspberry Pi) via RF.
- The Gateway further publishes the real time data using the Mosquitto and Kafka message broker and forwards it to the ELK stack for data analysis and Apache Spark for the prediction component.
- The prediction component uses the Linear Regression algorithm to predict the temperature values based on the home thermal model.
- Built a web application using AngularJS that helps monitor and control the thermostats, shows the Kibana visualizations (analytics) and the next 5 hours predicted temperature.

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
