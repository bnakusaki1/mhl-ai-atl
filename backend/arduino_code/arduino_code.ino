#include <SparkFun_Bio_Sensor_Hub_Library.h>
#include <Wire.h>

int resPin = 4;
int mfioPin = 5;

SparkFun_Bio_Sensor_Hub bioHub(resPin, mfioPin);
bioData body;

bool streaming = false;
unsigned long startTime = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  int result = bioHub.begin();
  if (result == 0)
    Serial.println("Sensor started!");
  else
    Serial.println("Could not communicate with the sensor!");

  Serial.println("Configuring Sensor...");
  int error = bioHub.configBpm(MODE_ONE);
  if (error == 0)
    Serial.println("Sensor configured.");
  else {
    Serial.print("Error configuring sensor: ");
    Serial.println(error);
  }

  delay(4000);
  Serial.println("Ready for START command.");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.equalsIgnoreCase("START")) {
      streaming = true;
      startTime = millis();
      Serial.println("ACK_START");
    } else if (cmd.equalsIgnoreCase("STOP")) {
      streaming = false;
      Serial.println("ACK_STOP");
    }
  }

  if (streaming) {
    body = bioHub.readBpm();

    unsigned long t_rel = millis() - startTime;
    float bpm = body.heartRate;

    if (bpm > 0.1) {
      Serial.print(t_rel);
      Serial.print(",");
      Serial.println(bpm, 2);
    }

    delay(250);
  } else {
    delay(10);
  }
}