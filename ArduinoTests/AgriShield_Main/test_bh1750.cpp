#include <Arduino.h>
#include "SystemData.h"
#include "SensorManager.h"
#include "DisplayManager.h"
#include "Logger.h"
#include "JsonManager.h"
#include "DiagnosticsManager.h"
#include "MemoryManager.h"

void run_test_bh1750() {
    Logger::info("Starting Step 3: BH1750 Light Sensor Validation");
    MemoryManager::printMemoryStats();
    
    // 1. Initialization
    DisplayManager::init();
    SensorManager::init();
    
    // Run diagnostics
    DiagnosticsManager::runSelfTest();
    
    // 2. Initial Setup
    SD_Network net = SystemData::getNetwork();
    net.wifiConnected = false;
    net.backendOnline = false;
    SystemData::setNetwork(net);
    
    unsigned long startTime = millis();
    unsigned long lastRead = 0;
    
    // 3. Test Loop (30 Seconds)
    while (millis() - startTime < 30000) {
        
        // Read Sensor every 2 seconds
        if (millis() - lastRead > 2000) {
            lastRead = millis();
            SensorManager::readTemperature();
            SensorManager::readHumidity();
            SensorManager::readLight();
            
            // Print JSON to Serial for Validation
            String json = JsonManager::buildTelemetryJson();
            Logger::info("Telemetry: " + json);
        }
        
        // Update OLED at 10 FPS
        DisplayManager::update();
        delay(10);
    }
    
    Logger::info("BH1750 Validation Pipeline Complete.");
}
