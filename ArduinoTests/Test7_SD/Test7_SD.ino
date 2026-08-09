/*
 * =========================================================
 * AGRI SHIELD - HARDWARE VALIDATION STAGE 1
 * MODULE: Micro SD Card Module
 * =========================================================
 * 
 * BOARD REQUIRED: ESP32 Dev Module
 * 
 * REQUIRED ARDUINO LIBRARIES (Install via Library Manager):
 * - SD (Native ESP32 Library)
 * - SPI (Native ESP32 Library)
 * 
 * WIRING (Standard VSPI):
 * ESP32 5V   -> SD VCC (Depends on module, 5V or 3V3)
 * ESP32 GND  -> SD GND
 * ESP32 G23  -> SD MOSI
 * ESP32 G19  -> SD MISO
 * ESP32 G18  -> SD SCK
 * ESP32 G5   -> SD CS
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
#include "StorageManager.h"

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
    StorageManager::init(); // This mounts the SD card
    
    Serial.println("Initialization Complete.");
    
    if (SystemData::getStorage().sdMounted) {
        bool pass = StorageManager::runDiagnosticsTest();
        if (pass) {
            Serial.println(">>> SD CARD DIAGNOSTICS: PASS (Read/Write OK)");
        } else {
            Serial.println(">>> SD CARD DIAGNOSTICS: FAIL");
        }
    }
}

void loop() {
    if (millis() - lastReadTime >= 2000) {
        lastReadTime = millis();
        
        Serial.println("\n--- Sweeping SD Status ---");
        SD_Storage stor = SystemData::getStorage();
        
        if (stor.sdMounted) {
            Serial.println("SD Status: MOUNTED | Size: " + String(stor.totalSpaceMB) + " MB | Free: " + String(stor.freeSpaceMB) + " MB [PASS]");
        } else {
            Serial.println("SD Status: ERROR OR NOT INSERTED [FAIL]");
        }
    }
}
