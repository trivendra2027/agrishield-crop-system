#include <Arduino.h>
#include "SystemData.h"
#include "SensorManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"
#include "DiagnosticsManager.h"
#include "PowerManager.h"
#include "MemoryManager.h"

void run_test_battery() {
    Logger::info("Starting Step 5: Battery & Power Validation");
    uint32_t heapBefore = MemoryManager::getFreeHeap();
    
    DisplayManager::init();
    SensorManager::init();
    PowerManager::init();
    
    uint32_t heapAfter = MemoryManager::getFreeHeap();
    Logger::info("Init Memory Delta: " + String(heapBefore - heapAfter) + " B");
    
    DiagnosticsManager::runSelfTest();
    
    unsigned long startTime = millis();
    unsigned long lastRead = 0;
    
    while (millis() - startTime < 30000) {
        if (millis() - lastRead > 2000) {
            lastRead = millis();
            SensorManager::readTemperature();
            SensorManager::readBattery();
            PowerManager::evaluatePowerState();
            
            String json = JsonManager::buildTelemetryJson();
            Logger::info("Telemetry: " + json);
        }
        
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("Battery & Power Validation Complete.");
}
