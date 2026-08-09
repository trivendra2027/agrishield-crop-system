#include <Arduino.h>
#include "SystemData.h"
#include "SensorManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"

// ==========================================
// Test: AHT20 + BMP280 Sensor Validation
// Replaces old DHT11 test (test_dht.cpp)
// ==========================================
void run_test_aht_bmp() {
    Logger::info("Starting AHT20 + BMP280 Sensor Validation");
    
    // 1. Initialization
    DisplayManager::init();
    SensorManager::init();
    
    // 2. Initial Setup
    SD_Network net = SystemData::getNetwork();
    net.wifiConnected = false;
    net.backendOnline = false;
    SystemData::setNetwork(net);
    
    unsigned long startTime = millis();
    unsigned long lastRead = 0;
    
    // 3. Test Loop (30 Seconds)
    while (millis() - startTime < 30000) {
        
        // Read Sensors every 2 seconds
        if (millis() - lastRead > 2000) {
            lastRead = millis();
            float temp = SensorManager::readTemperature();
            float hum = SensorManager::readHumidity();
            float pres = SensorManager::readPressure();
            
            Logger::info("AHT20 -> Temp: " + String(temp, 1) + "C, Hum: " + String(hum, 1) + "%");
            Logger::info("BMP280 -> Pressure: " + String(pres, 1) + " hPa");
            
            // Print JSON to Serial for Validation
            String json = JsonManager::buildTelemetryJson();
            Logger::info("Telemetry: " + json);
        }
        
        // Update OLED at 10 FPS
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("AHT20 + BMP280 Validation Pipeline Complete.");
}
