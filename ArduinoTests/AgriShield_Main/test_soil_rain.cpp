#include <Arduino.h>
#include "SystemData.h"
#include "SensorManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"
#include "DiagnosticsManager.h"
#include "MemoryManager.h"

void run_test_soil_rain() {
    Logger::info("Starting Step 4: Soil & Rain Validation");
    MemoryManager::printMemoryStats();
    
    DisplayManager::init();
    SensorManager::init();
    
    DiagnosticsManager::runSelfTest();
    
    unsigned long startTime = millis();
    unsigned long lastRead = 0;
    
    while (millis() - startTime < 30000) {
        if (millis() - lastRead > 2000) {
            lastRead = millis();
            SensorManager::readTemperature();
            SensorManager::readHumidity();
            SensorManager::readLight();
            SensorManager::readSoil();
            SensorManager::readRain();
            
            String json = JsonManager::buildTelemetryJson();
            Logger::info("Telemetry: " + json);
        }
        
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("Soil & Rain Validation Complete.");
}
