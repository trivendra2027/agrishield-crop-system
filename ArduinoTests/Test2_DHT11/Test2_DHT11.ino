/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: DHT11 Sensor
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - DHT sensor library (by Adafruit)
 * - Adafruit Unified Sensor (by Adafruit)
 * 
 * WIRING:
 * ESP32 3V3  -> DHT11 VCC
 * ESP32 GND  -> DHT11 GND
 * ESP32 G4   -> DHT11 DATA (Out)
 * 
 * Note: If using a raw DHT11 (no PCB), place a 10K resistor 
 * between VCC and DATA.
 * 
 * BAUD RATE: 115200
 * =========================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <DHT.h>

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
    Serial.println("Hardware Validation Mode: DHT11 Sensor");
    Serial.println("==========================================");
    
    SystemData::init();
    SensorManager::init(); // This will init DHT and I2C
    
    Serial.println("Initialization Complete. Entering read loop.");
}

void loop() {
    if (millis() - lastReadTime >= 3000) {
        lastReadTime = millis();
        
        Serial.println("\n--- Sweeping DHT11 ---");
        float t = SensorManager::readTemperature();
        float h = SensorManager::readHumidity();
        
        SD_Sensors sens = SystemData::getSensors();
        
        if (sens.temperatureValid) {
            Serial.println("Temperature: " + String(t) + " C [PASS]");
        } else {
            Serial.println("Temperature: " + String(t) + " C [FAIL]");
        }
        
        if (sens.humidityValid) {
            Serial.println("Humidity:    " + String(h) + " % [PASS]");
        } else {
            Serial.println("Humidity:    " + String(h) + " % [FAIL]");
        }
    }
}
