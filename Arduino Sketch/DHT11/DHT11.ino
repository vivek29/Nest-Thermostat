#include <dht.h>
#include <RCSwitch.h>
#include <Wire.h>
#include <rgb_lcd.h>

rgb_lcd lcd;
dht DHT;
RCSwitch mySwitch = RCSwitch();
String transmitTemperatureData;
String transmitHumidityData;
int randomVal;
int checkSum;
String checkSumStr;
int currentTemperature;
int currentHumidity;
int previousTemperature = 0;
int previousHumidity = 0;
int sendCount = 0;

const int colorR = 255;
const int colorG = 0;
const int colorB = 0;

#define DHT11_PIN 5

void setup()
{
  Serial.begin(115200);
  mySwitch.enableTransmit(10);

  lcd.begin(16, 2);
  lcd.setRGB(colorR, colorG, colorB);
    
    // Print a message to the LCD.
    lcd.setCursor(0,0);
    lcd.print("Temperature:");
    lcd.setCursor(0,1);
    lcd.print("Humidity:");

    delay(1000);
}

void loop()
{
  // READ DATA
  int chk = DHT.read11(DHT11_PIN);
  randomVal = random(1, 10);

  currentTemperature = DHT.temperature;
  lcd.setCursor(12, 0);
  lcd.print(currentTemperature);
  lcd.setCursor(14,0);
  lcd.print("C");
  delay(100);
  currentHumidity = DHT.humidity;
  lcd.setCursor(9, 1);
  lcd.print(currentHumidity);
  lcd.setCursor(11,1);
  lcd.print("%");
  delay(100);

  // SEND TEMPERATURE DATA IF THERE IS A CHANGE
  if (currentTemperature != previousTemperature) {
    checkSum = (4 + 1 + currentTemperature) * randomVal;
    if (checkSum < 100) {
      checkSumStr = "0" + String(checkSum);
    } else  {
      checkSumStr = String(checkSum);
    }
    transmitTemperatureData = String(4) + String(1) + String(currentTemperature) + String(randomVal) + checkSumStr;
    while (sendCount < 5) {
      mySwitch.send(transmitTemperatureData.toInt(), 27);
      delay(200);
      sendCount++;
    }
    previousTemperature = currentTemperature;
    sendCount = 0;
  }

  // SEND HUMIDITY DATA IF THERE IS A CHANGE
  if (currentHumidity != previousHumidity) {
    checkSum = (4 + 2 + currentHumidity) * randomVal;
    if (checkSum < 100) {
      checkSumStr = "0" + String(checkSum);
    } else  {
      checkSumStr = String(checkSum);
    }
    transmitHumidityData = String(4) + String(2) + String(currentHumidity) + String(randomVal) + checkSumStr;
    while (sendCount < 5) {
      mySwitch.send(transmitHumidityData.toInt(), 27);
      delay(200);
      sendCount++;
    }
    Serial.print(transmitHumidityData);
    Serial.print("\n");
    previousHumidity = currentHumidity;
    sendCount = 0;
  }
}
