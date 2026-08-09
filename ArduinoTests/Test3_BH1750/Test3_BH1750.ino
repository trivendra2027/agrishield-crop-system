/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: BH1750 Light Sensor
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - BH1750 (by Christopher Laws)
 * - DHT sensor library (by Adafruit)
 * - Adafruit Unified Sensor
 * 
 * WIRING:
 * ESP32 3V3  -> BH1750 VCC
 * ESP32 GND  -> BH1750 GND
 * ESP32 G22  -> BH1750 SCL
 * ESP32 G21  -> BH1750 SDA
 * 
 * BAUD RATE: 115200
 * =========================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <BH1750.h>

#include "SystemData.h"
#include "MemoryManager.h"
#include "ErrorManager.h"
#include "Logger.h"
#include "SensorManager.h"

unsigned long lastReadTime = 0;

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n==========================================");
    Serial.println("Hardware Validation Mode: BH1750 Light Sensor");
    Serial.println("==========================================");
    
    Wire.begin(); // Init I2C bus
    SystemData::init();
    SensorManager::init(); // This will initialize BH1750
    
    Serial.println("Initialization Complete. Entering read loop.");
}

void loop() {
    if (millis() - lastReadTime >= 3000) {
        lastReadTime = millis();
        
        Serial.println("\n--- Sweeping BH1750 ---");
        float lux = SensorManager::readLight();
        
        SD_Sensors sens = SystemData::getSensors();
        
        if (sens.lightValid) {
            Serial.println("Light Intensity: " + String(lux) + " lx [PASS]");
        } else {
            Serial.println("Light Intensity: " + String(lux) + " lx [FAIL]");
        }
    }
}
