/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: Battery & Charging System
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - None (Uses native ESP32 analogRead/digitalRead and Preferences)
 * 
 * WIRING:
 * ESP32 3V3  -> Battery Voltage Divider (Test Input)
 * ESP32 GND  -> Battery GND
 * ESP32 G33  -> Battery ADC Output
 * ESP32 G25  -> Charging Sense Pin (Pull to GND to mock charging)
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
    Serial.println("Hardware Validation Mode: Battery System");
    Serial.println("==========================================");
    
    SystemData::init();
    PreferencesManager::init();
    SensorManager::init();
    
    Serial.println("Initialization Complete. Entering read loop.");
}

void loop() {
    if (millis() - lastReadTime >= 2000) {
        lastReadTime = millis();
        
        Serial.println("\n--- Sweeping Battery System ---");
        float batteryPct = SensorManager::readBattery();
        
        SD_Sensors sens = SystemData::getSensors();
        
        if (sens.batteryValid) {
            String chargingStr = sens.batteryCharging ? "YES" : "NO";
            Serial.println("Battery: " + String(batteryPct, 1) + "% (" + String(sens.batteryVoltage, 2) + "V) | Charging: " + chargingStr + " [PASS]");
        } else {
            Serial.println("Battery: ERROR [FAIL]");
        }
    }
}
