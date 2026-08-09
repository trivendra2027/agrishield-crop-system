/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: Soil Moisture Sensor (Analog)
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - None (Uses native ESP32 analogRead and Preferences)
 * 
 * WIRING:
 * ESP32 3V3  -> Sensor VCC
 * ESP32 GND  -> Sensor GND
 * ESP32 G34  -> Sensor A0 (Analog Out)
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
    Serial.println("Hardware Validation Mode: Soil Moisture Sensor");
    Serial.println("==========================================");
    
    SystemData::init();
    PreferencesManager::init();
    SensorManager::init();
    
    Serial.println("Initialization Complete. Entering read loop.");
}

void loop() {
    if (millis() - lastReadTime >= 2000) {
        lastReadTime = millis();
        
        Serial.println("\n--- Sweeping Soil Sensor ---");
        float moisture = SensorManager::readSoil();
        
        SD_Sensors sens = SystemData::getSensors();
        
        if (sens.soilValid) {
            Serial.println("Soil Moisture: " + String(moisture, 1) + " % (ADC: " + String(sens.soilADC) + ") [PASS]");
        } else {
            Serial.println("Soil Moisture: " + String(moisture, 1) + " % [FAIL]");
        }
    }
}
