from pi_switch import RCSwitchReceiver
from hotqueue import HotQueue
from redis_cache import SimpleCache,CacheMissException

receiver = RCSwitchReceiver()
receiver.enableReceive(2)
queue = HotQueue("sensordata", host="localhost", port=6379, db=0)
cache = SimpleCache(15)

cache.flush()

previousTempData=0
previousHumData=0
checksum=0

while True:
    
    if receiver.available():
  
        received_value = receiver.getReceivedValue()
        currentData = str(received_value)

        try:
            if len(currentData) > 0:
                checksum = (int(currentData[0:1]) + int(currentData[1:2]) + int(currentData[2:4])) * int(currentData[4:5])
        except ValueError:
            continue

        if ((currentData[1:2] == "1" or currentData[1:2] == "2") and (currentData[4:5] != "0") and (len(currentData) == 8) and 
        (checksum == int(currentData[5:8]))):
            if (currentData[1:2] == "1" and received_value!=previousTempData) :
               print "inside if Temp"
               print currentData
               print cache.keys()
               if currentData in cache:
                   print "Found Temp Data"
               else:
                   print "Inside Else Temp"
                   queue.put(currentData)
                   cache.store(currentData,currentData)
                   previousTempData = received_value
            elif (currentData[1:2] == "2" and received_value!=previousHumData) :
                print "inside if Hum"
                print currentData
                print cache.keys()
                if currentData in cache:
                    print "Found Hum Data"
                else:
                    print "inside else hum data"
                    queue.put(currentData)
                    cache.store(currentData,currentData)
                    previousHumData = received_value
        else:
            print "Error in type of Data"
        
        receiver.resetAvailable()
