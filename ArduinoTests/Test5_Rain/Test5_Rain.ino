/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: Rain Sensor (Analog + Digital)
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - None (Uses native ESP32 analogRead/digitalRead and Preferences)
 * 
 * WIRING:
 * ESP32 3V3  -> Sensor VCC
 * ESP32 GND  -> Sensor GND
 * ESP32 G35  -> Sensor A0 (Analog Out)
 * ESP32 G32  -> Sensor D0 (Digital Out)
 * 
 * BAUD RATE: 115200
 * =========================================================
 */

#include <Arduino.h>
#include <Preferences.h>

#include "SystemData.h"
#include "MemoryManager.h"
#include "ErrorManager.h"
#include "Logger.h"
#include "PreferencesManager.h"
#include "CalibrationManager.h"
#include "SensorManager.h"

unsigned long lastReadTime = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n==========================================");
    Serial.println("Hardware Validation Mode: Rain Sensor");
    Serial.println("==========================================");
    
    SystemData::init();
    PreferencesManager::init();
    SensorManager::init();
    
    Serial.println("Initialization Complete. Entering read loop.");
}

void loop() {
    if (millis() - lastReadTime >= 2000) {
        lastReadTime = millis();
        
        Serial.println("\n--- Sweeping Rain Sensor ---");
        int isRaining = SensorManager::readRain();
        
        SD_Sensors sens = SystemData::getSensors();
        
        if (sens.rainValid) {
            String status = (isRaining == 1) ? "YES" : "NO";
            Serial.println("Rain Detected: " + status + " (Analog: " + String(sens.rainAnalog) + ", Digital: " + String(sens.rainDigital) + ") [PASS]");
        } else {
            Serial.println("Rain Detected: ERROR [FAIL]");
        }
    }
}
